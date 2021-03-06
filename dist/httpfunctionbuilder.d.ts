import { FunctionBuilder, FunctionBuilderContext } from "./functionbuilder";
import { HttpContext } from "./httpcontext";
import { ServerlessFunction } from "./serverlessfunctions";
import { AuthorizationOptions } from "./auth";
export declare class HttpFunctionBuilder extends FunctionBuilder<FunctionBuilderContext> {
    constructor(context?: FunctionBuilderContext);
    allow(options: AuthorizationOptions): HttpFunctionBuilder;
    allowAuthenticated(): HttpFunctionBuilder;
    onRequest(func: (context: HttpContext) => void | Promise<void>): ServerlessFunction;
    private parseMultipartData;
}
//# sourceMappingURL=httpfunctionbuilder.d.ts.map