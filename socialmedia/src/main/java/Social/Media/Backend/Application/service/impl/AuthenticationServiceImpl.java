package Social.Media.Backend.Application.service.impl;

import Social.Media.Backend.Application.dto.request.AuthenticationRequest;
import Social.Media.Backend.Application.dto.request.IntrospectRequest;
import Social.Media.Backend.Application.dto.response.AuthenticationResponse;
import Social.Media.Backend.Application.dto.response.IntrospectResponse;
import Social.Media.Backend.Application.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    @Override
    public AuthenticationResponse authenticate(AuthenticationRequest authenticationRequest) {
        return null;
    }

    @Override
    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        return null;
    }
}
