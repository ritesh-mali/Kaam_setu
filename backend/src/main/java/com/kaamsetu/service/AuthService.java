package com.kaamsetu.service;

import com.kaamsetu.dto.AuthResponse;
import com.kaamsetu.dto.LoginRequest;
import com.kaamsetu.dto.RegisterRequest;
import com.kaamsetu.dto.UserProfileDto;
import com.kaamsetu.model.Role;
import com.kaamsetu.model.ServiceCategory;
import com.kaamsetu.model.User;
import com.kaamsetu.model.WorkerProfile;
import com.kaamsetu.repository.ServiceCategoryRepository;
import com.kaamsetu.repository.UserRepository;
import com.kaamsetu.repository.WorkerProfileRepository;
import com.kaamsetu.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       WorkerProfileRepository workerProfileRepository,
                       ServiceCategoryRepository categoryRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = jwtUtil.generateToken(authentication);
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long workerProfileId = null;
        if (user.getRole() == Role.ROLE_WORKER) {
            workerProfileId = workerProfileRepository.findByUserId(user.getId())
                    .map(WorkerProfile::getId)
                    .orElse(null);
        }

        UserProfileDto profileDto = UserProfileDto.fromEntity(user, workerProfileId);
        return new AuthResponse(token, profileDto);
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email is already registered: " + req.getEmail());
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setPhone(req.getPhone());
        user.setRole(req.getRole() != null ? req.getRole() : Role.ROLE_CUSTOMER);
        user.setCity(req.getCity() != null ? req.getCity() : "New Delhi");
        user.setAddress(req.getAddress());
        user.setActive(true);

        // Assign default avatar
        String avatarSeed = req.getName().replaceAll("\\s+", "+");
        user.setAvatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=" + avatarSeed);

        User savedUser = userRepository.save(user);
        Long workerProfileId = null;

        if (savedUser.getRole() == Role.ROLE_WORKER) {
            WorkerProfile profile = new WorkerProfile();
            profile.setUser(savedUser);
            profile.setCity(savedUser.getCity());
            profile.setServiceArea(req.getServiceArea() != null ? req.getServiceArea() : savedUser.getCity());
            profile.setBio(req.getBio() != null ? req.getBio() : "Professional local service provider committed to high quality work.");
            profile.setSkills(req.getSkills() != null ? req.getSkills() : "General Repairs");
            profile.setExperienceYears(req.getExperienceYears() != null ? req.getExperienceYears() : 2);
            profile.setVisitingCharge(req.getVisitingCharge() != null ? req.getVisitingCharge() : 199.0);
            profile.setHourlyRate(req.getHourlyRate() != null ? req.getHourlyRate() : 299.0);
            profile.setEmergencyCharge(req.getEmergencyCharge() != null ? req.getEmergencyCharge() : 150.0);
            profile.setIdProofType(req.getIdProofType() != null ? req.getIdProofType() : "AADHAAR");
            profile.setIdProofNumber(req.getIdProofNumber());
            profile.setAvailable(true);
            profile.setVerified(false); // Admin reviews and verifies
            profile.setVerificationStatus("PENDING");
            profile.setRating(5.0);
            profile.setTotalReviews(0);
            profile.setCompletedJobsCount(0);

            if (req.getCategoryId() != null) {
                ServiceCategory category = categoryRepository.findById(req.getCategoryId()).orElse(null);
                profile.setCategory(category);
            }

            WorkerProfile savedProfile = workerProfileRepository.save(profile);
            workerProfileId = savedProfile.getId();
        }

        String token = jwtUtil.generateTokenForEmail(savedUser.getEmail());
        UserProfileDto profileDto = UserProfileDto.fromEntity(savedUser, workerProfileId);

        return new AuthResponse(token, profileDto);
    }

    public UserProfileDto getCurrentUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Long workerProfileId = null;
        if (user.getRole() == Role.ROLE_WORKER) {
            workerProfileId = workerProfileRepository.findByUserId(user.getId())
                    .map(WorkerProfile::getId)
                    .orElse(null);
        }

        return UserProfileDto.fromEntity(user, workerProfileId);
    }
}

