import chalk from "chalk";

const logger = (req, res, next) => {
    if (!req.originalUrl.startsWith("/.well-known")) {
        const method = chalk.green(req.method);
        const protocol = chalk.blue(req.protocol);
        const host = chalk.yellow(req.get("host"));
        const url = chalk.cyan(req.originalUrl);

        console.log(`${method} ${protocol}://${host}${url}`);
    }
    next();
};

export default logger;
