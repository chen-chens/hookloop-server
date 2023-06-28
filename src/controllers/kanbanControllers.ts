import CryptoJS from "crypto-js";
import { NextFunction, Request, Response } from "express";

import { forwardCustomError } from "@/middlewares";
import { Kanban, List, Tag } from "@/models";
import { IUser } from "@/models/userModel";
import WorkspaceMember from "@/models/workspaceMemberModel";
import Workspace from "@/models/workspaceModel";
import { ApiResults, StatusCode } from "@/types";
import { sendSuccessResponse } from "@/utils";
import mongoDbHandler from "@/utils/mongoDbHandler";

export default {
  createKanban: async (req: Request, res: Response, next: NextFunction) => {
    const { key, name, workspaceId } = req.body;
    if (!key) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "key",
        error: "kanban's key is required.",
      });
    } else if (!key.match(/^[0-9a-z-]+$/g)) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "key",
        error: "Key value only allows lowercase English, numbers and `-` symbols.",
      });
    } else if (!name) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "name",
        error: "kanban's name is required.",
      });
    } else if (!workspaceId) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
        field: "workspaceId",
        error: "workspaceId is required.",
      });
    } else {
      // 遞迴確認 key 為 unique
      const suggestKey = await (async function checkUniqueKey(uuid: string) {
        let uniqueKey = uuid;
        const existKanban = await Kanban.findOne({ key: uniqueKey });
        if (existKanban) {
          uniqueKey += CryptoJS.lib.WordArray.random(2).toString();
          uniqueKey = await checkUniqueKey(uniqueKey);
        }
        return uniqueKey;
      })(key);

      // suggestKey 與原始 key 不同時顯示錯誤
      if (suggestKey !== key) {
        forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_CREATE, {
          field: "key",
          error: "key already exists, unique requirement. Consider recommended key?",
          customMessage: {
            suggestKey,
          },
        });
      } else {
        const newKanban = await Kanban.create({
          key,
          name,
          workspaceId,
        });

        // eslint-disable-next-line no-underscore-dangle
        const newKanbanId = newKanban._id;

        // 找到 kanban 建立在哪個 workspace
        const targetWorkspace = await Workspace.findOne({ _id: workspaceId });
        // 如果 workspace 存在就把新建立的 kanban id 寫入資料庫
        if (targetWorkspace) {
          const kanbans = targetWorkspace?.kanbans.concat([newKanbanId]);
          targetWorkspace.kanbans = kanbans;
          await targetWorkspace.save();
        }

        // 建立預設 List
        const newLists = await List.insertMany(
          ["List-1", "List-2", "List-3"].map((listName) => ({
            name: listName,
            kanbanId: newKanbanId,
          })),
        );
        // 更新 Kanban 的 listOrder
        const kanban = await Kanban.findOneAndUpdate(
          { _id: newKanbanId },
          {
            $push: {
              listOrder: {
                // eslint-disable-next-line no-underscore-dangle
                $each: newLists.map((list) => list._id.toString()),
              },
            },
          },
        );

        if (kanban) {
          sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, {
            key: kanban.key,
            name: kanban.name,
            workspaceId: kanban.workspaceId,
            listOrder: kanban.listOrder,
            isArchived: kanban.isArchived,
          });
        } else {
          forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR);
        }
      }
    }
  },
  getKanbanByKey: async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    const { id } = req.user as IUser;

    if (!key) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_READ, {
        field: "key",
        error: "Kanban's key is required.",
      });
    } else {
      let kanban = await mongoDbHandler.getDb(null, next, "Kanban", Kanban, { key, isArchived: false }, null, {
        path: "listOrder",
        populate: {
          path: "cardOrder",
          select: [
            "_id",
            "name",
            "reporter",
            "assignee",
            "targetStartDate",
            "targetEndDate",
            "actualStartDate",
            "actualEndDate",
            "priority",
            "status",
            "tag",
            "isArchived",
          ],
          populate: [
            "cardCommentCount",
            {
              path: "notificationCommentCount",
              match: { toUserId: id, isRead: false },
            },
          ],
        },
      });
      if (!kanban) {
        forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_TO_GET_DATA, {
          field: "kanban",
          error: "kanban not found or archived.",
        });
      } else {
        const reqQuery = req.query;

        // 有過濾條件才進行卡片篩選
        if (
          Object.keys(reqQuery).indexOf("matchType") > -1 ||
          Object.keys(reqQuery).indexOf("reporter") > -1 ||
          Object.keys(reqQuery).indexOf("assignee") > -1 ||
          Object.keys(reqQuery).indexOf("priority") > -1 ||
          Object.keys(reqQuery).indexOf("status") > -1 ||
          Object.keys(reqQuery).indexOf("tag") > -1
        ) {
          // eslint-disable-next-line no-underscore-dangle
          kanban = kanban._doc;
          let { listOrder } = kanban;
          const { matchType, reporter, assignee, priority, status, tag } = reqQuery;
          const assignees = assignee ? (assignee as string).split(",") : [];
          const tags = tag ? (tag as string).split(",") : [];

          // 完全符合
          if (matchType === "fully") {
            listOrder = listOrder.map((list: any) => ({
              // eslint-disable-next-line no-underscore-dangle
              ...list._doc,
              cardOrder: list.cardOrder.filter((card: any) => {
                return !(
                  (reporter && card.reporter !== reporter) ||
                  (assignees.length && !assignees.every((assi: any) => card.assignee.includes(assi))) ||
                  (priority && card.priority !== priority) ||
                  (status && card.status !== status) ||
                  (tags.length && !tags.every((t: any) => card.tag.includes(t)))
                );
              }),
            }));
          }
          // 部分符合
          else {
            listOrder = listOrder.map((list: any) => ({
              // eslint-disable-next-line no-underscore-dangle
              ...list._doc,
              cardOrder: list.cardOrder.filter((card: any) => {
                return (
                  (reporter && card.reporter === reporter) ||
                  (assignees.length && assignees.some((assi: any) => card.assignee.includes(assi))) ||
                  (priority && card.priority === priority) ||
                  (status && card.status === status) ||
                  (tags.length && tags.some((t: any) => card.tag.includes(t)))
                );
              }),
            }));
          }

          // 過濾已封存 & 卡片數為 0 的 list
          listOrder = listOrder.filter((list: any) => !list.isArchived && !!list.cardOrder.length);

          kanban.listOrder = listOrder;
        }

        sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, kanban);
      }
    }
  },
  modifyKanbanKey: async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    const { newKey } = req.body;
    if (!key) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "key",
        error: "Kanban's key is required.",
      });
    } else if (newKey.indexOf(" ") > -1) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "key",
        error: "space is not allowed in key.",
      });
    } else {
      const updateResult = await Kanban.updateOne({ key }, { key: newKey });
      if (!updateResult.matchedCount) {
        forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
          error: `Kanban not found.`,
        });
      } else {
        const target = await mongoDbHandler.getDb(null, next, "Kanban", Kanban, { key: newKey }, { _id: 0 });
        if (!target) {
          forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR);
        } else {
          sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, {
            target,
          });
        }
      }
    }
  },
  renameKanban: async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    const { name } = req.body;
    if (!key) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "key",
        error: "Kanban's key is required.",
      });
    } else if (!name) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "name",
        error: "kanban's name is required.",
      });
    } else {
      mongoDbHandler.updateDb(res, next, "Kanban", Kanban, { key }, { name }, { _id: 0 });
    }
  },
  archiveKanban: async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    const { isArchived } = req.body;
    if (!key) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "key",
        error: "Kanban's key is required.",
      });
    } else if (Object.keys(req.body).indexOf("isArchived") < 0) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "isArchived",
        error: "isArchived is required.",
      });
    } else {
      mongoDbHandler.updateDb(res, next, "Kanban", Kanban, { key }, { isArchived }, { _id: 0 });
    }
  },
  pinKanban: async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    const { isPinned } = req.body;
    if (!key) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "key",
        error: "Kanban's key is required.",
      });
    } else if (Object.keys(req.body).indexOf("isPinned") < 0) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "isPinned",
        error: "isPinned is required.",
      });
    } else {
      mongoDbHandler.updateDb(res, next, "Kanban", Kanban, { key }, { isPinned }, { _id: 0 });
    }
  },
  getKanbanMembers: async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    const kanbanData = await Kanban.findOne({ key });
    if (!kanbanData) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_READ, {
        error: `Kanban not found.`,
      });
    } else {
      const workspaceData = await WorkspaceMember.find({ workspaceId: kanbanData.workspaceId }).populate([
        "workspace",
        "user",
      ]);
      if (!workspaceData) {
        forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR);
      } else {
        const membersData = workspaceData.map((item) => ({
          userId: item.userId,
          username: item.user?.username,
          role: item.role,
        }));
        res.json(membersData);
      }
    }
  },
  getTags: async (req: Request, res: Response, _: NextFunction) => {
    const { kanbanId } = req.params;
    const allTags = await Tag.find({ kanbanId, isArchived: false });
    sendSuccessResponse(res, ApiResults.SUCCESS_GET_DATA, allTags);
  },
  createTag: async (req: Request, res: Response, next: NextFunction) => {
    const { kanbanId } = req.params;
    const { name, color, icon } = req.body;
    const newTag = await Tag.create({ kanbanId, name, color, icon });
    if (!newTag) {
      forwardCustomError(next, StatusCode.INTERNAL_SERVER_ERROR, ApiResults.UNEXPECTED_ERROR);
    }
    const allTags = await Tag.find({ kanbanId, isArchived: false });
    sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, allTags);
  },
  getTagById: async (req: Request, res: Response, next: NextFunction) => {
    const { kanbanId, tagId } = req.params;
    mongoDbHandler.getDb(res, next, "Tag", Tag, { kanbanId, _id: tagId }, {});
  },
  updateTagById: async (req: Request, res: Response, next: NextFunction) => {
    const { kanbanId, tagId } = req.params;
    const { name, color, icon } = req.body;
    const newTag = await Tag.findOneAndUpdate({ kanbanId, _id: tagId }, { name, color, icon });
    if (!newTag) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "tagId",
        error: "Tag not found.",
      });
    }
    const allTags = await Tag.find({ kanbanId, isArchived: false });
    sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, allTags);
  },
  archiveTag: async (req: Request, res: Response, next: NextFunction) => {
    const { kanbanId, tagId } = req.params;
    const newTag = await Tag.findOneAndUpdate({ kanbanId, _id: tagId }, { isArchived: true });
    if (!newTag) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "tagId",
        error: "Tag not found.",
      });
    }
    const allTags = await Tag.find({ kanbanId, isArchived: false });
    sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, allTags);
  },
  filterKanbanCards: async (req: Request, res: Response, next: NextFunction) => {
    const { kanbanId } = req.params;
    const { matchType, reporter, assignee, priority, status, tag } = req.query;

    if (!kanbanId) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "kanbanId",
        error: "Kanban's kanbanId is required.",
      });
    } else if (!matchType) {
      forwardCustomError(next, StatusCode.BAD_REQUEST, ApiResults.FAIL_UPDATE, {
        field: "matchType",
        error: "matchType is required.",
      });
    } else {
      let lists = await mongoDbHandler.getDb(
        null,
        next,
        "List",
        List,
        { kanbanId, isArchived: false },
        { _id: 0 },
        "cardOrder",
        true,
      );
      const assignees = assignee ? (assignee as string).split(",") : [];
      const tags = tag ? (tag as string).split(",") : [];

      // 完全符合
      if (matchType === "fully") {
        lists = lists.map((list: any) => ({
          // eslint-disable-next-line no-underscore-dangle
          ...list._doc,
          cardOrder: list.cardOrder.filter((card: any) => {
            return (
              !card.isArchived &&
              !(
                (reporter && card.reporter !== reporter) ||
                (assignees.length && !assignees.every((assi: any) => card.assignee.includes(assi))) ||
                (priority && card.priority !== priority) ||
                (status && card.status !== status) ||
                (tags.length && !tags.every((t: any) => card.tag.includes(t)))
              )
            );
          }),
        }));
      }
      // 部分符合
      else {
        lists = lists.map((list: any) => ({
          // eslint-disable-next-line no-underscore-dangle
          ...list._doc,
          cardOrder: list.cardOrder.filter((card: any) => {
            return (
              !card.isArchived &&
              ((reporter && card.reporter === reporter) ||
                (assignees.length && assignees.some((assi: any) => card.assignee.includes(assi))) ||
                (priority && card.priority === priority) ||
                (status && card.status === status) ||
                (tags.length && tags.some((t: any) => card.tag.includes(t))))
            );
          }),
        }));
      }
      // 過濾卡片數為 0 的 list
      lists = lists.filter((list: any) => !!list.cardOrder.length);

      sendSuccessResponse(res, ApiResults.SUCCESS_CREATE, lists);
    }
  },
};
