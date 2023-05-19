import { Request } from "express";

type ValidationFn = (req: Request) => { field: string; error: string } | null;

export default ValidationFn;
