class ExecutionFailedError extends Error {
    constructor(executionArn: string) {
        super(`${executionArn}: execution failed`);
        this.name = 'ExecutionFailedError';
    }
}

module.exports = {
    ExecutionFailedError,
};
