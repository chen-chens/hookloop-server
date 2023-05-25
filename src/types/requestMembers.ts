import RoleType from "./roleType";

interface IRequestMembers {
  userId: string;
  role: RoleType;
  state?: string;
}
export default IRequestMembers;
