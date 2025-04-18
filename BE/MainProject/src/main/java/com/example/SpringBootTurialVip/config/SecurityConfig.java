package com.example.SpringBootTurialVip.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec;
import java.util.Arrays;
import java.util.List;

@Configuration//init và run các public method có @Bean vào ApllicationContext(IOC Container)
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {



    @Value("${jwt.signerKey}")
    private String signerKey;

    //Tạo biến để cho phép các endpoint
    private final String [] PUBLIC_ENDPOINT={
            "/users/createUser",
            "/users/verify",
            "/users/resend",
            "/common/**",
            "/auth/**",//Authentication Controller
            "/payment/**",//VNPAY
            "/product/**",
            "/post/posts",//XEM SAN PHAM

    };

    //    private final String [] PUBLIC_ENDPOINT_NEW={
//            "/auth/**"
//    };
    @Bean
    public HttpFirewall allowAllFirewall() {
        StrictHttpFirewall firewall = new StrictHttpFirewall();
        firewall.setAllowUrlEncodedSlash(true);
        firewall.setAllowUrlEncodedDoubleSlash(true);
        firewall.setAllowUrlEncodedPercent(true);
        firewall.setAllowBackSlash(true);
        firewall.setAllowSemicolon(true);
        firewall.setAllowUrlEncodedPeriod(true);
        // firewall.setAllowUrlEncodedQuestionMark(true);
        return firewall;
    }

//    @Bean
//    public WebSecurityCustomizer webSecurityCustomizer() {
//        return (web) -> web.ignoring().requestMatchers("/**");
//    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.cors(cors -> cors.configurationSource(corsConfigurationSource()));
        //http.cors().and().csrf().disable();

        //Cấu hình endpoint nào cần bảo vệ và endpoint nào ko cần
        //Cụ thể : sign up user , log in page ,...
        httpSecurity.authorizeHttpRequests(request -> request
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(PUBLIC_ENDPOINT)
                .permitAll()
                .requestMatchers(HttpMethod.GET,PUBLIC_ENDPOINT)//chỉ cho phép admin truy cập vào api này
                .permitAll()
                .requestMatchers(HttpMethod.POST,PUBLIC_ENDPOINT)
                .permitAll()
                // .requestMatchers(PUBLIC_ENDPOINT_NEW)
                //  .permitAll()
                .requestMatchers("/staff/**")
                .hasAnyRole("ADMIN")

                .requestMatchers("/swagger-ui/**").permitAll()
                .requestMatchers("/swagger-ui.html").permitAll()
                .requestMatchers("/swagger-ui/**")
                .permitAll()

                .requestMatchers("/v3/api-docs/**")
                .permitAll()

                .requestMatchers("/swagger-ui.html")
                .permitAll()

                .requestMatchers("/v3/api-docs/swagger-config")
                .permitAll()

                .requestMatchers("/feedback/feedback/all")
                .permitAll()

                .requestMatchers("/post/posts/search")
                .permitAll()

                .requestMatchers("/service/services/by-age-group")
                .permitAll()


                .requestMatchers("/product/addProduct")
                .permitAll()

                .requestMatchers("/consult/request")
                .permitAll()


                //.hasAuthority("ROLE_ADMIN")//chỉ cho phép admin truy cập vào api này
                //.hasRole(Role.ADMIN.name())
                .anyRequest()
                .authenticated());//Bước này vân sẽ chưa truy cập đc do csrf đc auto bật lên để protect => disable
        //Ngoài phân quyền trên endpoint thì ta có thể phân quyền trên method => EnabledMethodSecurity
        //Phổ biến nhất trong các dự án
        //Bỏ phần quyền trên endpoint tại đây trc
        //Sử dụng PreAuthorize , PostAuthori    ze đặt trên method cần phân quyền tại service

        //Sử dụng token để truy cập , sử dụng o2auth
        httpSecurity.oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwtConfigurer -> jwtConfigurer
                        //.jwkSetUri() , dùng cho bên thứ 3
                        .decoder(jwtDecoder())//cần implement
                        .jwtAuthenticationConverter(jwtAuthenticationConverter())//Nếu thêm method này thì authorize trên sẽ disabled
                ));




        httpSecurity.csrf(AbstractHttpConfigurer::disable);

        return httpSecurity.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000", "http://localhost:3001",
                "http://103.67.196.241:8080",
                "http://vaxchild.store"// Cho phép Swagger UI trên server

        )); // "*" cho phép tất cả, nếu cần
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }



    //Tác dụng là khai báo thông tin về role để phân quyền truy cập , cách 2 , cách 1 là dùng clasms ra scope
    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
//        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);

        return jwtAuthenticationConverter;
    }

    //Method này check token có hợp lệ kjo để cho phép truy cập
    @Bean
    JwtDecoder jwtDecoder(){
        SecretKeySpec secretKeySpec=new SecretKeySpec(signerKey.getBytes(),"HS512");
        return NimbusJwtDecoder
                .withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }






    //Vì mã hóa mật khẩu đc sử dụng nhiều nơi nên có thể tạo ở đây để sử dụng
    @Bean//đánh dấu là Bean sẽ làm method này đc đưa vào IOC Container để sử dụng ở các nơi khác
    PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder(10);
    }
}
