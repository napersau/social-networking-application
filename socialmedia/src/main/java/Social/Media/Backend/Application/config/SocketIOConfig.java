package Social.Media.Backend.Application.config;


import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.protocol.JacksonJsonSupport;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SocketIOConfig {
    @Bean
    public SocketIOServer socketIOServer() {
        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setPort(9092);
        config.setOrigin("*");

        JacksonJsonSupport jsonSupport = new JacksonJsonSupport() {
            @Override
            public void init(ObjectMapper objectMapper) {
                objectMapper.registerModule(new JavaTimeModule());
                super.init(objectMapper);
            }
        };
        config.setJsonSupport(jsonSupport);



        return new SocketIOServer(config);

    }
}
