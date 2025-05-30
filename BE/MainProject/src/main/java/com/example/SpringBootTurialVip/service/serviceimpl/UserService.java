package com.example.SpringBootTurialVip.service.serviceimpl;


import com.example.SpringBootTurialVip.constant.PredefinedRole;
import com.example.SpringBootTurialVip.dto.request.*;
import com.example.SpringBootTurialVip.dto.response.*;
import com.example.SpringBootTurialVip.entity.*;
import com.example.SpringBootTurialVip.enums.RelativeType;
import com.example.SpringBootTurialVip.exception.AppException;
import com.example.SpringBootTurialVip.exception.ErrorCode;
import com.example.SpringBootTurialVip.mapper.UserMapper;
import com.example.SpringBootTurialVip.repository.*;
import jakarta.mail.MessagingException;
import jakarta.mail.Multipart;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

//@RequiredArgsConstructor
@Slf4j
@Service//Layer này sẽ gọi xuống layer repository
public class UserService {
    @Autowired
    private UserRepository userRepository;

    //Khai báo đối tượng mapper
    @Autowired
    private UserMapper userMapper;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    private EmailServiceImpl emailServiceImpl;

    @Autowired
    private UserRelationshipRepository userRelationshipRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private UnderlyingConditionRepository underlyingConditionRepository;




    public User createUser(UserCreationRequest request,
                           MultipartFile avatarFile){

        if(userRepository.existsByUsername(request.getUsername()))
            throw new AppException(ErrorCode.USER_EXISTED);

        if(userRepository.existsByEmail(request.getEmail()))
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);

        if(userRepository.existsByPhone(request.getPhone()))
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);

        User user = userMapper.toUser(request);

        // Mã hóa password user
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        HashSet<Role> roles = new HashSet<>();
        roleRepository.findById(PredefinedRole.USER_ROLE).ifPresent(roles::add);

        // Set role mặc định cho tài khoản là Customer
        user.setRoles(roles);

        // Tạo mã xác thực tài khoản
        user.setVerificationcode(generateVerificationCode());
        user.setVerficationexpiration(LocalDateTime.now().plusMinutes(15));
        user.setEnabled(false);
        user.setCreateAt(LocalDateTime.now());

        // Nếu có file ảnh avatar, upload lên Cloudinary trước khi lưu user
        if (avatarFile != null && !avatarFile.isEmpty()) {
            try {
                String avatarUrl = fileStorageService.uploadFile(avatarFile);
                user.setAvatarUrl(avatarUrl);
            } catch (IOException e) {
                user.setAvatarUrl("null");
            }
        }

        // Gửi mã xác thực qua email
        sendVerificationEmail(user);

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        return userRepository.save(user);
    }

    public void createCustomerByStaff(CustomerCreationRequest request) {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new AppException(ErrorCode.USER_EXISTED);

        if (userRepository.existsByEmail(request.getEmail()))
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);

        if (userRepository.existsByPhone(request.getPhone()))
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);

        User user = userMapper.toUser(request);

        // **Tạo mật khẩu ngẫu nhiên**
        String generatedPassword = generateRandomPassword();
        user.setPassword(passwordEncoder.encode(generatedPassword));

        HashSet<Role> roles = new HashSet<>();
        roleRepository.findById(PredefinedRole.USER_ROLE).ifPresent(roles::add);

        user.setRoles(roles);
        user.setEnabled(true);
        user.setCreateAt(LocalDateTime.now());

        // **Gửi mật khẩu qua email**
        String emailContent = String.format(
                "Xin chào %s,\n\nTài khoản của bạn đã được tạo bởi nhân viên của chúng tôi.\n\n" +
                        "Username: %s\nPassword: %s\n\n" +
                        "Vui lòng đăng nhập và đổi mật khẩu ngay lập tức để bảo mật tài khoản của bạn.",
                request.getUsername(), request.getUsername(), generatedPassword
        );

        emailServiceImpl.sendCustomEmail(request.getEmail(), "Tài khoản của bạn đã được tạo", emailContent);

        userRepository.save(user);
    }

    private String generateRandomPassword() {
        return UUID.randomUUID().toString().substring(0, 8); // Tạo mật khẩu ngẫu nhiên 8 ký tự
    }




    //Tạo tài khoản cho staff
    public User createStaff(UserCreationRequest request,
                           MultipartFile avatarFile){

        if(userRepository.existsByUsername(request.getUsername()))
            throw new AppException(ErrorCode.USER_EXISTED);

        if(userRepository.existsByEmail(request.getEmail()))
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);

        if(userRepository.existsByPhone(request.getPhone()))
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);
        //Sử dụng class AppException để báo lỗi đã define tại ErrorCode

        User user=userMapper.toUser(request);//Khi có mapper

        //Mã hóa password user
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        HashSet<Role> roles=new HashSet<>();

        roleRepository.findById(PredefinedRole.STAFF_ROLE).ifPresent(roles::add);
        user.setRoles(roles);

        //Dat cho mac dinh cho tai khoan chua duoc xac thuc
        user.setEnabled(true);

        // Nếu có file ảnh avatar, upload lên Cloudinary trước khi lưu user
        if (avatarFile != null && !avatarFile.isEmpty()) {
            try {
                byte[] avatarBytes = avatarFile.getBytes();
                String avatarUrl = fileStorageService.uploadFile(avatarFile);
                user.setAvatarUrl(avatarUrl); // Lưu URL ảnh vào User
            } catch (IOException e) {
                throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
            }
        }

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        return userRepository.save(user);

    }

    //Method xac thuc account de cho phep dang nhap
    public void verifyUser(VerifyAccountRequest verifyAccountRequest) {
        User optionalUser = userRepository.findByEmail(verifyAccountRequest.getEmail());
        if (optionalUser != null) {
            User user = optionalUser;
            if (user.getVerficationexpiration().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Verification code has expired");
            }
            if (user.getVerificationcode().equals(verifyAccountRequest.getVerificationCode())) {
                user.setEnabled(true);
                user.setVerificationcode(null);
                user.setVerficationexpiration(null);
                userRepository.save(user);
            } else {
                throw new RuntimeException("Invalid verification code");
            }
        } else {
            throw new RuntimeException("User not found");
        }
    }

    //Method cho phep gui lai ma code
    public void resendVerificationCode(String email) {
        User optionalUser = userRepository.findByEmail(email);
        if (optionalUser != null ) {
            User user = optionalUser;
            if (user.isEnabled()) {
                throw new RuntimeException("Account is already verified");
            }
            user.setVerificationcode(generateVerificationCode());
            user.setVerficationexpiration(LocalDateTime.now().plusHours(1));
            sendVerificationEmail(user);
            userRepository.save(user);
        } else {
            throw new RuntimeException("User not found");
        }
    }

    //Method gui email
    private void sendVerificationEmail(User user) {
        String subject = "Account Verification";
        String verificationCode = "VERIFICATION CODE " + user.getVerificationcode();
        String htmlMessage = "<html>"
                + "<head><meta charset='UTF-8'></head>"
                + "<body style=\"font-family: Arial, sans-serif;\">"
                + "<div style=\"background-color: #f5f5f5; padding: 20px;\">"
                + "<h2 style=\"color: #333;\">Chào mừng bạn đến với web vaccine của chúng tôi!</h2>"
                + "<p style=\"font-size: 16px;\">Mời bạn nhập mã code phía dưới để xác thực tài khoản :</p>"
                + "<div style=\"background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);\">"
                + "<h3 style=\"color: #333;\">Mã Code:</h3>"
                + "<p style=\"font-size: 18px; font-weight: bold; color: #007bff;\">" + verificationCode + "</p>"
                + "</div>"
                + "</div>"
                + "</body>"
                + "</html>";


        try {
            emailServiceImpl.sendVerificationEmail(user.getEmail(), subject, htmlMessage);
        } catch (MessagingException e) {
            // Handle email sending exception
            e.printStackTrace();
        }
    }

    //Method tạo mã xác thực
    private String generateVerificationCode() {
        Random random = new Random();
        int code = random.nextInt(900000) + 100000;
        return String.valueOf(code);
    }


    //Danh sách user
    @PreAuthorize("hasRole('ADMIN')")//Chỉ cho phép admin
    public List<User> getUsers(){
        log.info("PreAuthorize đã chặn nếu ko có quyền truy cập nên ko thấy dòng này trong console ," +
                "chỉ có Admin mới thấy đc dòng này sau khi đăng nhập ");
        return userRepository.findAll();
    }

    //@PostAuthorize("hasRole('ADMIN') || returnObject.username == authentication.name")//Post sẽ run method trc r check sau
    //Như khai báo thì chỉ cho phép truy cập nếu id kiếm trùng id đang login
    //Kiếm user băằng ID
    public UserResponse getUserById(Long id){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        // Kiểm tra nếu không có parentId → không phải trẻ em
        if (user.getParentid() != null) {
            throw new RuntimeException("Đây là tài khoản trẻ em");
        }

        // Convert User sang DTO
        UserResponse response = userMapper.toUserResponse(user);

        // Lấy danh sách con của user
        List<User> children = userRepository.findByParentid(id);

        // Gán quan hệ mặc định là CHA_ME cho mỗi bé
        List<ChildResponse> childResponses = children.stream()
                .map(child -> new ChildResponse(child, RelativeType.CHA_ME))
                .toList();

        // Gắn vào response
        response.setChildren(childResponses);

        return response;
    }

    public User getUserByID(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }


    public UserResponse getChildById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.getParentid() == null) {
            throw new AppException(ErrorCode.NOT_A_CHILD);
        }

        return userMapper.toUserResponse(user);
    }

    public UserResponse getUserInfoWithChildrenById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Nếu là trẻ → báo lỗi
        if (user.getParentid() != null) {
            throw new AppException(ErrorCode.USER_IS_CHILD);
        }

        // Map info user
        UserResponse response = userMapper.toUserResponse(user);

        // Lấy danh sách trẻ
        List<User> children = userRepository.findByParentid(userId);

        List<ChildResponse> childResponses = children.stream()
                .map(child -> {
                    List<UserRelationship> relationships = userRelationshipRepository.findByChild(child);
                    return new ChildResponse(child, relationships);
                })
                .toList();

        response.setChildren(childResponses);

        return response;
    }

    //Lấy thông tin hiện tại đang log in
    public UserResponse getMyInfo(){
        var context = SecurityContextHolder.getContext();
        //Tên user đang log in
        String name=context.getAuthentication().getName();

        User user =userRepository.findByUsername(name).orElseThrow(
                () -> new AppException((ErrorCode.USER_NOT_EXISTED)));

                return userMapper.toUserResponse(user);
    }


    public UserResponse getMyInfoWithChildren() {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        User user = userRepository.findByUsername(name)
                .orElseThrow(() -> new AppException((ErrorCode.USER_NOT_EXISTED)));

        UserResponse response = userMapper.toUserResponse(user);

        List<User> children = userRepository.findByParentid(user.getId());

        List<ChildResponse> childResponses = children.stream()
                .map(child -> {
                    List<UserRelationship> relationships = userRelationshipRepository.findByChild(child);
                    return new ChildResponse(child, relationships);
                })
                .toList();

        response.setChildren(childResponses);
        return response;
    }



    //Cập nhật thông tin ver cũ ( đang xài )
    @PostAuthorize("returnObject.username == authentication.name")
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateUser(user, request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

//        var roles = roleRepository.findAllById(request.getRoles());
//        user.setRoles(new HashSet<>(roles));

        return userMapper.toUserResponse(userRepository.save(user));
    }



    //Cập nhật thông tin ver mới
    public User updateUser(User user) {
        return userRepository.save(user);
    }



    public User updateUserByResetToken(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // **Bước 1: Xóa dữ liệu liên quan**
        userRelationshipRepository.deleteByUserId(userId);  // Xóa quan hệ
        reactionRepository.deleteByUserId(userId); // Xóa phản ứng
        reactionRepository.deleteByChildId(userId); // Xóa phản ứng có liên quan đến trẻ
        notificationRepository.deleteByUserId(userId); // Xóa thông báo liên quan đến user
        feedbackRepository.deleteByUserId(userId); // Xóa feedback

        // **Bước 2: Xóa User**
        userRepository.delete(user);
    }




    //Tạo hồ sơ trẻ
    //Tạo tài khoản
    @Transactional
    public ChildResponse addChild(ChildCreationRequest request,
                         MultipartFile avatarFile) {
        // Lấy người tạo từ SecurityContext
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Tên của người tạo trẻ và có quan hệ vs trẻ : "+String.valueOf(username));



        User relative = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        log.info("User hiện tại là :"+String.valueOf(relative));

        // Kiểm tra nếu `relationshipType` bị null thì báo lỗi
        if (request.getRelationshipType() == null) {
            throw new AppException(ErrorCode.INVALID_RELATIONSHIP_TYPE);
        }

        // Kiểm tra xem trẻ đã tồn tại hay chưa
        if (userRepository.existsByFullnameAndBod(request.getFullname(), request.getBod())) {
            throw new AppException(ErrorCode.CHILD_EXISTED);
        }

        // Chuyển đổi request thành User entity bằng mapper
        User child = userMapper.toUser(request);

        // Gán role cho trẻ
        HashSet<Role> roles = new HashSet<>();
        roleRepository.findById(PredefinedRole.CHILD_ROLE).ifPresent(roles::add);
        child.setRoles(roles);
        //Dat cho mac dinh cho tai khoan chua duoc xac thuc
        child.setEnabled(true);

        // Nếu có file ảnh avatar, upload lên Cloudinary trước khi lưu user
        if (avatarFile != null && !avatarFile.isEmpty()) {
            try {
                byte[] avatarBytes = avatarFile.getBytes();
                String avatarUrl = fileStorageService.uploadFile(avatarFile);
                child.setAvatarUrl(avatarUrl); // Lưu URL ảnh vào User
            } catch (IOException e) {
                throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
            }
        }

        try {
            child = userRepository.save(child);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.CHILD_EXISTED);
        }

        // Lưu quan hệ giữa người tạo và trẻ
        UserRelationship relationship = new UserRelationship();
        relationship.setRelationshipType(request.getRelationshipType());
        relationship.setChild(child);
        relationship.setRelative(relative);
        userRelationshipRepository.save(relationship);

        // Lấy danh sách quan hệ của trẻ
        List<UserRelationship> relationships = userRelationshipRepository.findByChild(child);

        // Trả về thông tin trẻ kèm quan hệ
        return new ChildResponse(child, relationships);
    }




    //Xem hồ sơ trẻ em chỉ xem đc con của customer
//    public List<ChildResponse> getChildInfo() {
//        // Lấy username của user đang đăng nhập
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        String username = authentication.getName();
//
//        // Tìm user hiện tại theo username (phải là Customer)
//        User customer = userRepository.findByUsername(username)
//                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
//
//        // Lấy danh sách trẻ thuộc về Customer
//        List<User> children = userRepository.findByParentid(customer.getId());
//
//        // Chuyển đổi dữ liệu sang DTO (ChildResponse)
//        return children.stream().map(userMapper::toChildResponse).collect(Collectors.toList());
//    }

    public List<ChildResponse> getChildInfo() {
        // Lấy username của người đang đăng nhập
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // Tìm Parent theo username
        User parent = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Lấy danh sách trẻ của parent
        List<User> children = userRepository.findByParentid(parent.getId());

        // Chuyển đổi thành danh sách ChildResponse
        return children.stream().map(child -> {
            // Lấy danh sách quan hệ của trẻ
            List<UserRelationship> relationships = userRelationshipRepository.findByChild(child);

            // Trả về ChildResponse với danh sách relative
            return new ChildResponse(child, relationships);
        }).collect(Collectors.toList());
    }



    public ChildResponse updateChildrenByParent(ChildUpdateRequest request) {
        // Lấy username từ người dùng đang đăng nhập
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // Tìm Parent theo username
        User parent = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Tìm đứa trẻ theo userId trong request
        User child = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Kiểm tra xem child có thuộc về parent không
        if (!child.getParentid().equals(parent.getId())) {
            throw new SecurityException("You do not have permission to update this child.");
        }

        // Cập nhật thông tin cho đúng child
        child.setFullname(request.getFullname());
        child.setBod(request.getBod());
        child.setGender(request.getGender());
        child.setHeight(request.getHeight());
        child.setWeight(request.getWeight());

        // Lưu vào DB
        userRepository.save(child);

        return userMapper.toChildResponse(child);
    }


    //
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    //Thêm token xác nhận để nhập lại password
    public void updateUserResetToken(String email, String resetToken) {
        User user = userRepository.findByEmail(email);
        user.setResetToken(resetToken);
        userRepository.save(user);
    }

    public User getUserByToken(String token) {
        return userRepository.findByResetToken(token);
    }

    public Optional<User> getUserByUsername(String username){
        return userRepository.findByUsername(username);
    }


    public ChildResponse getChildByUserId(Long childId) {
        // Lấy user đang đăng nhập từ SecurityContext
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User parent = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Tìm trẻ theo ID
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new AppException(ErrorCode.CHILD_NOT_FOUND));

        // Kiểm tra xem user có phải là cha/mẹ của trẻ hay không
        boolean isParent = userRelationshipRepository.findByChildAndRelative(child, parent).isPresent();
        if (!isParent) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION);
        }

        // Lấy danh sách quan hệ của trẻ
        List<UserRelationship> relationships = userRelationshipRepository.findByChild(child);

        // Trả về thông tin trẻ
        return new ChildResponse(child, relationships);
    }

    public void changePassword(ChangePasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail());
        if (user == null) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_OLD_PASSWORD);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }


    public List<ChildWithInjectionInfoResponse> getMyChildrenWithInjectionDetails() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long parentId = jwt.getClaim("id");

        List<User> children = userRepository.findByParentid(parentId); // Lấy danh sách con

        return children.stream().map(child -> {
            ChildWithInjectionInfoResponse dto = new ChildWithInjectionInfoResponse();
            dto.setId(child.getId());
            dto.setFullname(child.getFullname());
            dto.setBirthDate(child.getBod());
            dto.setGender(child.getGender());
            dto.setHeight(child.getHeight());
            dto.setWeight(child.getWeight());

            List<OrderDetail> odList = orderDetailRepository.getVaccinatedDetailsWithReactions(child.getId());

            List<ChildWithInjectionInfoResponse.InjectionInfo> injections = odList.stream().map(od -> {
                List<String> reactions = od.getReactions() != null
                        ? od.getReactions().stream().map(Reaction::getSymptoms).toList()
                        : new ArrayList<>();
                return new ChildWithInjectionInfoResponse.InjectionInfo(
                        od.getProduct().getTitle(),
                        od.getVaccinationDate(),
                        reactions
                );
            }).toList();


            dto.setInjections(injections);
            return dto;
        }).toList();
    }

    public UserResponse getParentOfChild(Long childId) {
        // B1: Lấy thông tin user từ id
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("User (child) not found"));

        // B2: Kiểm tra nếu không có parentId => đây không phải trẻ con
        if (child.getParentid() == null) {
            throw new RuntimeException("User này không phải là trẻ em (vì không có parentId)");
        }

        // B3: Lấy parent dựa vào parentId
        User parent = userRepository.findById(child.getParentid())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cha mẹ"));

        // B4: map sang UserResponse để trả ra
        return userMapper.toUserResponse(parent);
    }

    public void createCustomerWithChildByStaff(CustomerWithChildRequest request) {
        // Kiểm tra trùng username, email, phone
        if (userRepository.existsByUsername(request.getUsername()))
            throw new AppException(ErrorCode.USER_EXISTED);

        if (userRepository.existsByEmail(request.getEmail()))
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);

        if (userRepository.existsByPhone(request.getPhone()))
            throw new AppException(ErrorCode.PHONE_ALREADY_EXISTS);

        // Tạo đối tượng User cho khách hàng (Customer)
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setFullname(request.getFullname());
        user.setBod(request.getBod());  // Ngày sinh của khách hàng
        user.setGender(request.getGender());  // Giới tính của khách hàng
        user.setEnabled(true);  // Tài khoản đã được kích hoạt
        user.setCreateAt(LocalDateTime.now());

        // Tạo mật khẩu ngẫu nhiên cho khách hàng
        String generatedPassword = generateRandomPassword();
        user.setPassword(passwordEncoder.encode(generatedPassword));

        // Thiết lập quyền cho customer
        HashSet<Role> roles = new HashSet<>();
        roleRepository.findById(PredefinedRole.USER_ROLE).ifPresent(roles::add);
        user.setRoles(roles);

        // Lưu khách hàng (user) vào cơ sở dữ liệu
        userRepository.save(user);

        // Tạo các trẻ em từ request
        if (request.getChildren() != null) {
            for (ChildRequest childRequest : request.getChildren()) {
                User child = new User();
                child.setFullname(childRequest.getChildName());
                child.setBod(childRequest.getChildBod());  // Ngày sinh của trẻ
                child.setGender(childRequest.getChildGender());  // Giới tính của trẻ
                child.setParentid(user.getId());  // Liên kết với cha/mẹ (parentId)
                child.setEnabled(true);  // Tạo tài khoản cho trẻ
                child.setHeight(childRequest.getChildHeight());
                child.setWeight(childRequest.getChildWeight());

                // Gán Role `ROLE_CHILD` cho trẻ
                HashSet<Role> childRoles = new HashSet<>();
                roleRepository.findById("ROLE_CHILD").ifPresent(childRoles::add);
                child.setRoles(childRoles);

                // Lưu thông tin trẻ vào cơ sở dữ liệu
                userRepository.save(child);

                // Thêm bệnh nền cho trẻ (nếu có)
                if (childRequest.getChildConditions() != null && !childRequest.getChildConditions().isEmpty()) {
                    for (UnderlyingConditionRequestDTO conditionDTO : childRequest.getChildConditions()) {
                        UnderlyingCondition condition = new UnderlyingCondition();
                        condition.setConditionName(conditionDTO.getConditionName());
                        condition.setConditionDescription(conditionDTO.getNote());
                        condition.setUser(child);  // Liên kết bệnh nền với trẻ
                        underlyingConditionRepository.save(condition);
                    }
                }

                // Lưu mối quan hệ giữa cha/mẹ và trẻ
                UserRelationship relationship = new UserRelationship();
                relationship.setRelationshipType(childRequest.getRelationshipType());  // Mối quan hệ (cha, mẹ, ông bà...)
                relationship.setChild(child);
                relationship.setRelative(user);  // Liên kết với cha/mẹ
                userRelationshipRepository.save(relationship);
            }
        }

        // Gửi mật khẩu qua email cho khách hàng
        String emailContent = String.format(
                "Xin chào %s,\n\nTài khoản của bạn đã được tạo bởi nhân viên của chúng tôi.\n\n" +
                        "Username: %s\nPassword: %s\n\n" +
                        "Vui lòng đăng nhập và đổi mật khẩu ngay lập tức để bảo mật tài khoản của bạn.",
                request.getUsername(), request.getUsername(), generatedPassword
        );
        emailServiceImpl.sendCustomEmail(request.getEmail(), "Tài khoản của bạn đã được tạo", emailContent);
    }

    // Phương thức lấy thông tin người thân của trẻ qua ID

    public ParentOfChild getParentInfo(Long childId) {
        // Tìm trẻ em theo ID
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trẻ"));

        // Lấy parentid từ trẻ
        Long parentId = child.getParentid();
        if (parentId == null) {
            throw new RuntimeException("Không có ID phụ huynh phù hợp với trẻ. Vui lòng kiểm tra lại.");
        }

        // Truy xuất thông tin người thân (parent) từ parentid
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phụ huynh"));

        // Truy xuất mối quan hệ từ bảng tbl_user_relationship
        Optional<UserRelationship> relationship = userRelationshipRepository.findByChildIdAndRelativeId(childId, parentId);
        if (!relationship.isPresent()) {
            throw new RuntimeException("Relationship not found");
        }

        // Lấy thông tin mối quan hệ (relationship_type)
        RelativeType relationshipType = relationship.get().getRelationshipType(); // "CHA_ME", "ANH_CHI", v.v.

        // Truy xuất bệnh nền của trẻ từ bảng UnderlyingCondition
        List<String> underlyingConditions = underlyingConditionRepository.findByUserId(childId)
                .stream()
                .map(UnderlyingCondition::getConditionName)
                .collect(Collectors.toList());

        // Lấy lịch sử tiêm chủng của trẻ, với phản ứng sau tiêm
        List<VaccinationHistoryResponse> vaccinationHistory = orderDetailRepository.getVaccinationHistory(childId)
                .stream()
                .map(vaccineHistory -> {
                    // Lấy thông tin phản ứng sau tiêm (nếu có)
                    ReactionResponse reaction = null;

                    // Kiểm tra và lấy phản ứng nếu có
                    if (vaccineHistory.getOrderDetailId() != null) {
                        List<Reaction> reactions = reactionRepository.findByOrderDetailId(vaccineHistory.getOrderDetailId());
                        if (!reactions.isEmpty()) {
                            reaction = new ReactionResponse(reactions.get(0)); // Chỉ lấy phản ứng đầu tiên, nếu có
                        }
                    }

                    return new VaccinationHistoryResponse(
                            vaccineHistory.getOrderDetailId(),
                            vaccineHistory.getVaccineName(),
                            vaccineHistory.getVaccinationDate(),
                            vaccineHistory.getQuantity(),
                            reaction // Thêm phản ứng vào lịch sử tiêm chủng
                    );
                })
                .collect(Collectors.toList());

        // Lấy lịch sử phản ứng của trẻ (nếu có)
        List<ReactionSummaryResponse> reactionHistory = reactionRepository.findByChildId(childId)
                .stream()
                .map(reaction -> new ReactionSummaryResponse(reaction))  // Chuyển đổi thành ReactionSummaryResponse
                .collect(Collectors.toList());

        // Chuyển thông tin người thân thành ParentOfChild
        ParentOfChild parentDTO = new ParentOfChild();
        parentDTO.setId(parent.getId());
        parentDTO.setFullname(parent.getFullname());
        parentDTO.setEmail(parent.getEmail());
        parentDTO.setPhone(parent.getPhone());
        parentDTO.setUsername(parent.getUsername());
        parentDTO.setBod(parent.getBod());
        parentDTO.setGender(parent.getGender());
        parentDTO.setEnabled(parent.isEnabled());
        parentDTO.setVaccinationHistory(vaccinationHistory);  // Thêm lịch sử tiêm chủng
        parentDTO.setUnderlyingConditions(underlyingConditions);  // Thêm bệnh nền
        parentDTO.setReactionHistory(reactionHistory);  // Thêm phản ứng sau tiêm

        // Gán relativeType vào ParentOfChild dựa trên mối quan hệ từ bảng tbl_user_relationship
        switch (relationshipType) {
            case CHA_ME:
                parentDTO.setRelativeType(RelativeType.CHA_ME);
                break;
            case ANH_CHI:
                parentDTO.setRelativeType(RelativeType.ANH_CHI);
                break;
            case CHU_THIEM:
                parentDTO.setRelativeType(RelativeType.CHU_THIEM);
                break;
            case ONG_BA:
                parentDTO.setRelativeType(RelativeType.ONG_BA);
                break;
            default:
                parentDTO.setRelativeType(null);  // Quan hệ không xác định
                break;
        }

        return parentDTO;
    }









}


