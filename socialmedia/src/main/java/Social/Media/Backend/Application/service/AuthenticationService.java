package Social.Media.Backend.Application.service;


import Social.Media.Backend.Application.dto.request.AuthenticationRequest;
import Social.Media.Backend.Application.dto.request.IntrospectRequest;
import Social.Media.Backend.Application.dto.response.AuthenticationResponse;
import Social.Media.Backend.Application.dto.response.IntrospectResponse;
import com.nimbusds.jose.JOSEException;

import java.text.ParseException;

public interface AuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest authenticationRequest);
    IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException;
}
