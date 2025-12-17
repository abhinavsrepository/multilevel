package com.realestate.mlm.util;

import com.realestate.mlm.model.User;
import com.realestate.mlm.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Utility class for accessing security context information
 */
public class SecurityUtil {

    private SecurityUtil() {
        // Private constructor to prevent instantiation
    }

    /**
     * Get the current authenticated user from SecurityContext
     *
     * @return User entity of the currently authenticated user
     * @throws IllegalStateException if no authentication is found or user is not authenticated
     */
    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found in security context");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomUserDetails) {
            return ((CustomUserDetails) principal).getUser();
        }

        throw new IllegalStateException("Principal is not an instance of CustomUserDetails");
    }

    /**
     * Get the current authenticated user's database ID
     *
     * @return User ID (Long)
     * @throws IllegalStateException if no authentication is found
     */
    public static Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    /**
     * Get the current authenticated user's MLM user ID (e.g., MLM001)
     *
     * @return User's MLM ID (String)
     * @throws IllegalStateException if no authentication is found
     */
    public static String getCurrentUserMlmId() {
        return getCurrentUser().getUserId();
    }

    /**
     * Get the current authenticated user's email
     *
     * @return User's email address
     * @throws IllegalStateException if no authentication is found
     */
    public static String getCurrentUserEmail() {
        return getCurrentUser().getEmail();
    }

    /**
     * Get the current authenticated user's role
     *
     * @return User's role (ADMIN, MANAGER, MEMBER, FRANCHISE)
     * @throws IllegalStateException if no authentication is found
     */
    public static User.Role getCurrentUserRole() {
        return getCurrentUser().getRole();
    }

    /**
     * Check if current user has a specific role
     *
     * @param role The role to check
     * @return true if user has the specified role, false otherwise
     */
    public static boolean hasRole(User.Role role) {
        try {
            return getCurrentUserRole() == role;
        } catch (IllegalStateException e) {
            return false;
        }
    }

    /**
     * Check if current user is an admin
     *
     * @return true if user is an admin, false otherwise
     */
    public static boolean isAdmin() {
        return hasRole(User.Role.ADMIN);
    }

    /**
     * Get the Authentication object from SecurityContext
     *
     * @return Authentication object, or null if not authenticated
     */
    public static Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    /**
     * Check if there is an authenticated user in the security context
     *
     * @return true if a user is authenticated, false otherwise
     */
    public static boolean isAuthenticated() {
        Authentication authentication = getAuthentication();
        return authentication != null &&
               authentication.isAuthenticated() &&
               !(authentication.getPrincipal() instanceof String); // Exclude "anonymousUser"
    }
}
