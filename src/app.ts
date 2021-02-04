import Fastify, { FastifyInstance, FastifyReply, RouteShorthandOptions } from "fastify"
import fetch from "node-fetch"

interface Options {
    pkg: string
    pkgAgent?: string
    host?: string
    pkgId?: string
    tag?: string,
    res: FastifyReply
    protocol: "http" | "https"
}

const app: FastifyInstance = Fastify({ logger: process.env.NODE_ENV !== "production" })
const uaRegex = process.env.NODE_ENV !== "production" ? /^(npm|yarn|pnpm|curl)/gi : /^(npm|yarn|pnpm)/gi

const opts = (tag = false): RouteShorthandOptions => {
    const Schema = {
        schema: {
            params: {
                type: "object",
                properties: {
                    pkg: {
                        type: "string"
                    }
                } as Record<string, Record<string, string>>
            },
            headers: {
                type: "object",
                properties: {
                    "user-agent": { type: "string" },
                    "pacote-pkg-id": { type: "string" },
                    "host": { type: "string" }
                },
                required: ["user-agent", "host"]
            }
        }
    }

    if(tag) Schema.schema.params.properties.tag = {
        type: "string"
    }

    return Schema
}

app.get("/-/tarball/:pkg", opts(), async (req, res) => {
    const { pkg } = req.params as { pkg: string }
    const pkgAgent = req.headers["user-agent"]?.match(uaRegex)?.[0]
    const { host } = req.headers
    const pkgId = req.headers["pacote-pkg-id"]?.[0]

    return solver({
        pkg,
        pkgAgent,
        host,
        pkgId,
        tag: "latest",
        res,
        protocol: req.protocol
    })
})

app.get("/-/tarball/:pkg/:tag", opts(true), async (req, res) => {
    const { pkg, tag } = req.params as { pkg: string, tag: string }
    const pkgAgent = req.headers["user-agent"]?.match(uaRegex)?.[0]
    const { host } = req.headers
    const pkgId = req.headers["pacote-pkg-id"]?.[0]

    return solver({
        pkg,
        pkgAgent,
        host,
        pkgId,
        tag,
        res,
        protocol: req.protocol
    })
})


async function solver({ pkg, pkgAgent, host, pkgId, res, tag, protocol }: Options) {
    let origin: string | void = void 0

    if (!pkgAgent) return {
        status: 400,
        error: "Bad Request",
        message: "Only using via [npm|yarn|pnpm] is allowed."
    }

    if (pkgAgent === "npm" && pkgId) {
        origin = new URL(pkgId.split("@").slice(1).join("")).origin
    } else if (host) {
        origin = new URL(`${protocol}://${host}`).origin
    }

    if (!origin) return {
        status: 400,
        error: "Bad Request",
        message: "Unable to fetch registry origin from given headers. Check if this problem solves after updating your package manager and try again."
    }

    try {
        const pkgInfo = await fetch(`${origin}/${pkg}/${tag}`).then(r => r.json())

        return res.redirect(pkgInfo.dist.tarball)
    } catch (e) {
        return {
            status: 406,
            error: "Method Not Allowed",
            message: "Couldn't fetch package information from your verdaccio provider. Check if this problem solves after updating your package manager or if provided valid verdaccio URL."
        }
    }
}

export default app