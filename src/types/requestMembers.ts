import RoleType from "./roleType";

interface IRequestMembers {
  userId: string;
  role: RoleType;
  isdelete?: boolean;
}
export default IRequestMembers;
