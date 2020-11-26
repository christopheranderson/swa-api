import { AuthorizationOptions, FunctionBuilder, FunctionBuilderContext } from "./functionbuilder";
import { RpcContext } from "./rpccontext";
import { ServerlessFunction } from "./serverlessfunctions";

export class RpcFunctionBuilder extends FunctionBuilder<FunctionBuilderContext> {
    constructor(context?: FunctionBuilderContext) {
        const factory = (ctx: FunctionBuilderContext) => new RpcFunctionBuilder(ctx);
        super(factory, FunctionBuilderContext, context);
    }

    allow(options: AuthorizationOptions): RpcFunctionBuilder {
        return super.allow(options) as RpcFunctionBuilder;
    }

    allowAuthenticated(): RpcFunctionBuilder {
        return super.allowAuthenticated() as RpcFunctionBuilder;
    }

    onInvoke(func: (context: RpcContext) => void | Promise<void>): ServerlessFunction {
        return async (funcContext, ...args) => {
            const rpcContext = new RpcContext();

            rpcContext.user = this.decodeAuthInfo(funcContext.req);

            if (!this.isAuthorized(rpcContext.user)) {
                funcContext.res = { status: rpcContext.user ? 403 : 401 };
                return;
            }

            rpcContext.input = funcContext.req?.body?.data;
            rpcContext.log = funcContext.log;

            const result = await Promise.resolve(func(rpcContext));

            funcContext.res?.json({
                data: result
            });
        };
    }
}