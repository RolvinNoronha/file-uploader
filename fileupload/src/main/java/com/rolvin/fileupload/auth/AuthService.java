package com.rolvin.fileupload.auth;

import com.rolvin.fileupload.config.JwtService;
import com.rolvin.fileupload.token.Token;
import com.rolvin.fileupload.token.TokenRepository;
import com.rolvin.fileupload.token.TokenType;
import com.rolvin.fileupload.user.Role;
import com.rolvin.fileupload.user.User;
import com.rolvin.fileupload.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final TokenRepository tokenRepository;

    public AuthResponse register(RegisterRequest request)
    {
        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        User savedUser = userRepository.save(user);
        String jwtToken = jwtService.generateToken(user);

        saveUserToken(savedUser, jwtToken);

        return AuthResponse.builder().token(jwtToken).build();
    }

    public AuthResponse login(LoginRequest request)
    {
        if (request.getEmail() == null) {
            return null;
        }

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            return null;
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        if (!authentication.isAuthenticated()) {
            return AuthResponse.builder().token("").build();
        }

        String jwtToken = jwtService.generateToken(user);

        revokeAllUserTokens(user);
        saveUserToken(user, jwtToken);

        return AuthResponse.builder().token(jwtToken).build();
    }

    private void revokeAllUserTokens(User user)
    {
        List<Token> validUserTokens = tokenRepository.findAllValidTokensOfUser(user.getId());
        if (validUserTokens.isEmpty())
        {
            return;
        }

        validUserTokens.forEach(token -> {
            token.setExpired(true);
            token.setRevoked(true);
        });

        tokenRepository.saveAll(validUserTokens);
    }

    private void saveUserToken(User savedUser, String jwtToken) {
        Token token = Token.builder()
                .user(savedUser)
                .token(jwtToken)
                .tokenType(TokenType.BEARER)
                .expired(false)
                .revoked(false)
                .build();

        tokenRepository.save(token);
    }
}
