export const validateRequest = (schema, target = 'body') => {
    return async (req, res, next) => {
        let dataToValidate;

        switch (target) {
            case 'query':
                dataToValidate = req.query;
                break;
            case 'params':
                dataToValidate = req.params;
                
                break;
            case 'body':
            default:
                dataToValidate = req.body;
                break;
        }

        console.log(dataToValidate)

        const result = schema.safeParse(dataToValidate);
        

        if (!result.success) {
            const formattedErrors = Object.entries(result.error.format())
                .filter(([key]) => key !== "_errors")
                .map(([field, error]) => ({
                    field,
                    message: Array.isArray(error) ? error.join(", ") : error._errors?.join(", ") || "Invalid input"
                }));

            return res.status(400).json({
                success: false,
                message: "Validation Failed.",
                errors: formattedErrors
            });
        }

        // ✅ Use Object.assign to avoid reassigning req.query/body/params
        switch (target) {
            case 'query':
                Object.assign(req.query, result.data);
                break;
            case 'params':
                Object.assign(req.params, result.data);
                break;
            case 'body':
            default:
                Object.assign(req.body, result.data);
                break;
        }

        next();
    };
};

export default validateRequest;
