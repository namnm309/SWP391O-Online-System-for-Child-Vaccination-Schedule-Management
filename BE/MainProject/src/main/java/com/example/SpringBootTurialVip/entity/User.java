package com.example.SpringBootTurialVip.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
//@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity//Đánh dấu đây là 1 table để map lên từ database
@Table(name="tbl_users")
// hibernate dưới jpa sẽ giúp chúng ta lm vc vs database
public class User  {
    @Id//Định nghĩa cho ID
    @GeneratedValue(strategy = GenerationType.IDENTITY)//Tránh bị scan ID
    @Column(name="user_id")
    private Long id;

    @Column(name="parent_id")
    private Long parentid;

    @Column(name="username")
    private String username;

    @Column(name="fullname")
    private String fullname;

    @Column(name="password")
    private String password;

    @Column(name="email")
    private String email;

    @Column(name="phone")
    private String phone;

    @Column(name="birth_date")
    private LocalDate bod;

    @Column(name="gender")
    private String gender;

    @Column(name="height")
    private Double height=0.0;

    @Column(name="weight")
    private Double weight=0.0;

    @Column(name="enabled")
    private boolean enabled;

    @Column(name="verification_cod")
    private String verificationcode;

    @Column(name="verification_expiration")
    private LocalDateTime verficationexpiration;

    @ManyToMany(fetch = FetchType.EAGER)
    Set<Role> roles;

//    private Boolean accountNonLocked;

    private String resetToken;

    //avatar
    @Column(name="avatar_url")
    private String avatarUrl;

    //Ngày tạo user
    @Column(name = "create_at")
    private LocalDateTime createAt;

    public User() {
        this.createAt = LocalDateTime.now();
    }
    @ManyToMany
    @JoinTable(
            name = "tbl_user_permissions",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "permission_name")
    )
    private Set<Permission> permissions;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<UnderlyingCondition> underlyingConditions; // Liên kết với bảng bệnh nền


}
