package com.realestate.mlm.security;

import com.realestate.mlm.exception.ResourceNotFoundException;
import com.realestate.mlm.model.User;
import com.realestate.mlm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
            .orElseGet(() -> userRepository.findByMobile(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email or mobile: " + username))
            );
        return new CustomUserDetails(user);
    }

    public UserDetails loadUserById(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return new CustomUserDetails(user);
    }
}
