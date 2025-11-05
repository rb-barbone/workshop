import * as auth from "./auth-schema";
import * as todo from "./todos";
import * as task from "./tasks"

export const schema = { ...auth, ...todo, ...task };
