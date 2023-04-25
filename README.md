# hookloop-server

HookLoop Side Project / Back-End : This is a project tracking application by using **Node.js** and **Typescript**.

#### Project Status: Developing.

## Prerequisites

- Node.js
- Yarn

## Execution

### To run the server

- execute: `yarn dev`
- eslint: `yarn lint`

## Core Skills

- [`express`](https://github.com/expressjs/express)
- [`bcryptjs`](https://github.com/dcodeIO/bcrypt.js/)
- [`jsonwebtoken`](https://github.com/auth0/node-jsonwebtoken)
- [`mongoose`](https://github.com/Automattic/mongoose)
- [`validator`](https://github.com/validatorjs/validator.js/)

## Tools

- [`TypeScript`](https://www.typescriptlang.org/) : Strongly typed programming language builds on JavaScript.
- [`husky`](https://github.com/typicode/husky) : Unify git commit tools.
- [`commitlint`](https://github.com/conventional-changelog/commitlint#shared-configuration) : Lint git commit message.
- [`commitizen`](https://github.com/commitizen/cz-cli) : Auto generate commit followed by commitlint convention.
- [`conventional-changelog-cli`](https://github.com/conventional-changelog/conventional-changelog) : Generate a CHANGELOG from git metadata.
- [`eslint-config-airbnb`](https://github.com/airbnb/javascript): Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript/tree/master/react).
- [`ts-node`](https://github.com/TypeStrong/ts-node)
- [`zod`](https://github.com/colinhacks/zod) :
- [lint-staged](https://github.com/okonet/lint-staged) : Only Lint staged files in Git.

## Coding Style

- **Naming Convention**
  - `Variable`: PascalCase Naming（小駝峰命名）
  - `Constant`: 使用全大寫，中間用底線分開
  - `Function`: PascalCase Naming（小駝峰命名）
  - `Type`: CamelCase Naming（大駝峰命名）
  - `Interface`: 開頭使用大寫 `I`，並且遵照大駝峰命名
- **Others**
  - import module 放置順序：使用 eslint-plugin-simple-import-sort
  - import 路徑：使用 path alias（@）
  - Function：使用箭頭函式
- **Linter**
  - Prettier
    - 引號：使用單引號 singleQuote
    - 句尾分號：不省略

## Folder Structure

- 參考 : [`node-express-boilerplate`](https://github.com/hagopj13/node-express-boilerplate/tree/master/src)
- 每個資料夾都需新增 `index.ts` 將內容一致導出

```
    src/
    ├── controllers/ : 負責處理路由的請求和回應
    │   ├── homeController.ts
    │   ├── userController.ts
    │   └── ...
    │
    ├── models/ : 定義資料庫表的欄位、資料驗證規則等
    │   ├── user.ts
    │   ├── product.ts
    │   └── ...
    │
    ├── routes/ : 定義路由等
    │   ├── homeRoutes.ts
    │   ├── userRoutes.ts
    │   └── ...
    │
    ├── db/
    │   ├── connections.ts : 資料庫連接設定
    │   ├──
    │   └── ...
    │
    ├── utils/
    │   ├──
    │   └── ...
    │
    │
    ├── test/ 測試用
    │   ├──
    │   └── ...
    │
    │
    ├── config.env : 資料庫連接字串、API 金鑰 等配置
    ├── server.ts : endtry point
    │
    │
    ├── package.json
    ├── README.md
    ├── tsconfig.json
    ├── yarn.lock
    └── ...

```

## Version Control - Git

- Commit Message Guidelines
  - 參考 : [https://github.com/angular/angular](https://github.com/angular/angular)
  - {功能}:{Commit 簡述}
    - 例： feat: add register email regex checking
- Branch Naming
  - Main Branch(Deploy to Production)：main
  - Develop Branch：dev
  - Other Branch Naming：{功能}/{分支簡述(以分號 "-" 區隔)} （功能規範依照 Commit Message Guidelines）
    - 例：feat/profile-page

## API Docs

| #                      | API                                          | Method   | Description                                              | Status |
| ---------------------- | -------------------------------------------- | -------- | -------------------------------------------------------- | ------ |
| R-01                   | `/users`                                     | `POST`   | 使用者註冊                                               | --     |
| L-01                   | `/auth/login`                                | `POST`   | 使用者登入                                               | --     |
| F-01                   | `/auth/forgetPassword`                       | `POST`   | 忘記密碼發信                                             | --     |
| F-02                   | `/auth/verifyPassword`                       | `POST`   | 驗證使用者輸入驗證碼是否正確                             | --     |
| P-01                   | `/users/me`                                  | `GET`    | 取得會員資料                                             | --     |
| P-02                   | `/users/me`                                  | `PUT`    | 更改資料                                                 | --     |
| P-03                   | `/auth/verifyEmail`                          | `POST`   | 驗證 email                                               | --     |
| P-04                   | `/users/me/isActive`                         | `PATCH`  | 關閉帳號                                                 | --     |
| P-05                   | `/users/me/password`                         | `PATCH`  | 更改密碼                                                 | --     |
| D-01                   | `/workspaces`                                | `GET`    | 撈取全部 Workspace 清單                                  | --     |
| W-01                   | `/workspaces/:id`                            | `PUT`    | 更改 Workspace 資料                                      | --     |
| W-02                   | `/workspaces/:id/isArchived`                 | `PATCH`  | 封存 Workspace                                           | --     |
| W-03                   | `/workspaces`                                | `POST`   | 新增 Workspace                                           | --     |
| W-04                   | `/workspaces`                                | `GET`    | 撈出 Workspace 所有資料                                  | --     |
| W-05                   | `/workspaces/:id/availableUsers`             | `GET`    | 撈取可加入 Workspace 成員清單                            | --     |
| W-06                   | `/workspaces/:id/isPinned`                   | `PUT`    | 將 Workspace 設為最愛                                    | --     |
| W-07                   | `/workspaces/:workspaceId/members/:memberId` | `DELETE` | 將指定 User 移除 Workspace                               | --     |
| K-01                   | `/kanbans`                                   | `GET`    | 取得全部 Kanban                                          | --     |
| K-02                   | `/kanbans`                                   | `POST`   | 新增 Kanban                                              | --     |
| K-03                   | `/kanbans/:id`                               | `GET`    | 取得 Kanban                                              | --     |
| K-04                   | `/kanbans/:id`                               | `PUT`    | 更新 Kanban                                              | --     |
| K-05                   | `/kanbans/:id/users`                         | `GET`    | 取得 Kanban 的成員                                       | --     |
| K-06                   | `/kanbans/:id/isArchived`                    | `PATCH`  | 封存/取消封存 Kanban                                     | --     |
| K-07                   | `/kanbans/:id/isPinned`                      | `PATCH`  | 置頂/取消置頂 Kanban                                     | --     |
| K-08                   | `/kanbans/:id/lists`                         | `PUT`    | 更新 List                                                | --     |
| K-09                   | `/kanbans/:id/lists`                         | `POST`   | 新增 List                                                | --     |
| K-10                   | `/kanbans/:id/lists/order`                   | `PATCH`  | 移動 List                                                | --     |
| K-11                   | `/lists/:listId/cards/:cardId`               | `PATCH`  | 移動 Card                                                | --     |
| K-12                   | `/kanbans/:kanbanId/lists/:listId`           | `DELETE` | 刪除 List                                                | --     |
| K-13                   | `/lists/:listId/cards/:cardId`               | `DELETE` | 刪除 Card                                                | --     |
| C-01                   | `/kanbans/:id/cards`                         | `GET`    | 取得所有 Card                                            | --     |
| C-02                   | `/kanbans/:id/cards`                         | `POST`   | 新增 Card                                                | --     |
| C-03                   | `/cards/:id`                                 | `GET`    | 取得單筆 Card 資料 (含 Card、Message、Notification 資料) | --     |
| C-04                   | `/cards/:id`                                 | `PUT`    | 更新 Card 一般資料 ( 不含 Attachment /                   |
| Message、Notification) | --                                           |
| C-05                   | `/cards/:id/isArchived`                      | `PATCH`  | 刪除(封存) Card                                          | --     |
| C-06                   | `/cards/:id/attachments`                     | `POST`   | 上傳附件                                                 | --     |
| C-07                   | `/cards/:id/attachments`                     | `DELETE` | 刪除附件                                                 | --     |
| C-08                   | `/cards/:id/messages`                        | `POST`   | 新增留言                                                 | --     |
| C-09                   | `/cards/:cardId/messages/:messageId`         | `PUT`    | 修改留言                                                 | --     |
| B-01                   | `/admin/users`                               | `GET`    | 取得搜尋條件下，所有使用者清單                           | --     |
| B-02                   | `/admin/users/:id`                           | `GET`    | 取得單一使用者資訊                                       | --     |
| B-03                   | `/admin/users/:id`                           | `PATCH`  | 更改會員資料（Plan Type, 封存）                          | --     |
| B-04                   | `/admin/plans/:id`                           | `GET`    | 取得 Plan 資訊                                           | --     |

## Contributors

- [Ariean]()
- [Emi]()
- [Jason]()
- [Joanna](https://chen-chens.github.io/myWebsite/)
- [Yuna]()
- [Yun]()
