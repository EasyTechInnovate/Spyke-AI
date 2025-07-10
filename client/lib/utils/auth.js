export const getUserRole = (userData) => {
    // Priority order for multiple roles
    const rolePriority = ['admin', 'moderator', 'seller', 'buyer', 'user'];
    
    if (!userData?.roles || !Array.isArray(userData.roles)) {
        return 'user'; // default role
    }
    
    // Return highest priority role
    for (const role of rolePriority) {
        if (userData.roles.includes(role)) {
            return role;
        }
    }
    
    return 'user';
};

export const hasRole = (userData, role) => {
    return userData?.roles?.includes(role) || false;
};

export const getRedirectPath = (userData) => {
    const primaryRole = getUserRole(userData);
    
    const roleRoutes = {
        admin: '/admin',
        moderator: '/moderate',
        seller: '/seller/dashboard',
        buyer: '/',
        user: '/'
    };
    
    return roleRoutes[primaryRole] || '/';
};
