import User from "../auth/auth.model.js";
import ApiError from "../../common/utils/api-error.js";

// Get all users
const getUsers = async () => {
    try {
        return await User.find().lean();
    } catch (error) {
        throw ApiError.internal("Failed to retrieve users");
    }
};

// Get user by id
const getUserById = async (userId) => {
    const user = await User.findById(userId).lean();

    if (!user) {
        throw ApiError.notFound("User not exist with this id");
    }

    return user;
};

// Reusable update helper
const updateUser = async (userId, updateData) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        {
            returnDocument: 'after',
            runValidators: true,
        }
    );

    if (!user) {
        throw ApiError.notFound("User not exist with this id");
    }

    return user;
};

// Update user
const updateUserById = async (userId, updateData) => {
    return updateUser(userId, updateData);
};

// Delete user
const deleteUserById = async (userId) => {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
        throw ApiError.notFound("User not exist with this id");
    }

    return user;
};

// Update role
const updateUserRoleById = async (userId, newRole) => {
    return updateUser(userId, { role: newRole });
};

// Update status that user can be active, inactive.
const updateUserStatusById = async (userId, newStatus) => {
    return updateUser(userId, { isActive: newStatus });
};

export {
    getUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    updateUserRoleById,
    updateUserStatusById,
};