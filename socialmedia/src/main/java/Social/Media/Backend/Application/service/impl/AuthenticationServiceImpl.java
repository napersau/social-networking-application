package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.request.AuthenticationRequest;
import Social.Media.Backend.Application.dto.request.IntrospectRequest;
import Social.Media.Backend.Application.dto.request.LogoutRequest;
import Social.Media.Backend.Application.dto.request.RefreshRequest;
import Social.Media.Backend.Application.dto.response.AuthenticationResponse;
import Social.Media.Backend.Application.dto.response.IntrospectResponse;
import Social.Media.Backend.Application.entity.InvalidatedToken;
import Social.Media.Backend.Application.entity.User;
import Social.Media.Backend.Application.exception.AppException;
import Social.Media.Backend.Application.exception.ErrorCode;
import Social.Media.Backend.Application.repository.InvalidatedTokenRepository;
import Social.Media.Backend.Application.repository.UserRepository;
import Social.Media.Backend.Application.service.AuthenticationService;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Objects;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UserRepository userRepository;
    private final InvalidatedTokenRepository invalidatedTokenRepository;


    @NonFinal
    @Value("${jwt.signerKey}")
    protected String signerKey;

    // Xác thực Bearer Token
    @Override
    public AuthenticationResponse authenticate(AuthenticationRequest authenticationRequest) {

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        var user = userRepository.findByUsername(authenticationRequest.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean authenticated =  passwordEncoder.matches(authenticationRequest.getPassword(), user.getPassword());
        if(!authenticated || !user.getIsActive()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        if(authenticationRequest.getLoginMethod().equals("LoginNormal") && user.getGoogleAccountId() == 1) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        var token = generateToken(user);
        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .build();
    }


    // Check hạn Token
    @Override
    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        String token = request.getToken();

        if (token == null || token.isBlank()) {
            return IntrospectResponse.builder()
                    .valid(false)
                    .userId(null)
                    .build();
        }

        boolean isValid = true;
        SignedJWT jwt = null;

        try {
            jwt = verifyToken(token);
        } catch (AppException e) {
            isValid = false;
        }

        return IntrospectResponse.builder()
                .userId(jwt != null ? jwt.getJWTClaimsSet().getLongClaim("userId") : null)
                .valid(isValid)
                .build();
    }

    @Override
    public void logout(LogoutRequest request) throws ParseException, JOSEException {

        var signToken = verifyToken(request.getToken());

        String jit = signToken.getJWTClaimsSet().getJWTID();
        Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jit)
                .expiryTime(expiryTime)
                .build();

        invalidatedTokenRepository.save(invalidatedToken);

    }

    @Override
    public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {

        var signedJWT = verifyToken(request.getToken());

        var jit = signedJWT.getJWTClaimsSet().getJWTID();
        var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jit)
                .expiryTime(expiryTime)
                .build();

        invalidatedTokenRepository.save(invalidatedToken);

        var username = signedJWT.getJWTClaimsSet().getSubject();

        var user = userRepository.findByUsername(username).orElseThrow(
                () -> new AppException(ErrorCode.UNAUTHENTICATED)
        );

        var token = generateToken(user);

        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .build();
    }

    private String generateToken(User user) {

        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("duckhoi.com")
                .claim("userId", user.getId())
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(1, ChronoUnit.HOURS).toEpochMilli()
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", user.getRole())
                .build();
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);
        try {
            jwsObject.sign(new MACSigner(signerKey.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token",e);
            throw new RuntimeException(e);
        }

    }

    private SignedJWT verifyToken(String token) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(signerKey.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        if (!(verified && expiryTime.after(new Date())))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        if (invalidatedTokenRepository
                .existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        return signedJWT;
    }
}
