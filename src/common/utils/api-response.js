class ApiResponse {
    static ok(res, message = "Success", data = null) {
        return res.status(200).json({
            success: true,
            message,
            data,
        });
    }

    static created(res, message = "Created successfully", data = null) {
        return res.status(201).json({
            success: true,
            message,
            data,
        });
    }

    static accepted(res, message = "Request accepted", data = null) {
        return res.status(202).json({
            success: true,
            message,
            data,
        });
    }

    static noContent(res) {
        return res.status(204).send()
    }
}

export default ApiResponse;