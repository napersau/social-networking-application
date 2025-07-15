package Social.Media.Backend.Application.dto.request;

import lombok.Data;

import java.util.ArrayList;
import java.util.Date;

@Data
public class GoogleAccountRequest {
    private String at_hash;
    private String sub;
    private boolean email_verified;
    private String iss;
    private String given_name;
    private String nonce;
    private String picture;
    private ArrayList<String> aud;
    private String azp;
    private String name;
    private Date exp;
    private String family_name;
    private Date iat;
    private String email;
}
