package com.kaamsetu.config;

import com.kaamsetu.model.*;
import com.kaamsetu.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           ServiceCategoryRepository categoryRepository,
                           WorkerProfileRepository workerProfileRepository,
                           BookingRepository bookingRepository,
                           ReviewRepository reviewRepository,
                           ChatMessageRepository chatMessageRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            seedCategories();
        }

        if (userRepository.count() == 0) {
            seedUsersAndWorkers();
        }
    }

    private void seedCategories() {
        List<ServiceCategory> categories = Arrays.asList(
                new ServiceCategory("Plumber", "plumber", "Leak repair, pipe fitting, taps, toilet cistern, sanitary installation", "Wrench", 199.0),
                new ServiceCategory("Electrician", "electrician", "Switchboard repair, wiring, fan/geyser repair, short circuit fix, MCB", "Zap", 149.0),
                new ServiceCategory("Carpenter", "carpenter", "Furniture repair, door locks, modular kitchen assembly, hinge fixes", "Hammer", 249.0),
                new ServiceCategory("Appliance Repair", "appliance-repair", "AC servicing, refrigerator gas charge, washing machine, microwave repair", "Tv", 299.0),
                new ServiceCategory("Painter", "painter", "Interior/exterior wall painting, waterproofing, touch-ups & putty", "Paintbrush", 349.0),
                new ServiceCategory("House Cleaner", "house-cleaner", "Deep cleaning, bathroom scrub, kitchen degreasing, sofa shampoo", "Sparkles", 299.0)
        );
        categoryRepository.saveAll(categories);
    }

    private void seedUsersAndWorkers() {
        // 1. Admin
        User admin = new User("KaamSetu Admin", "admin@kaamsetu.com", passwordEncoder.encode("admin123"), "9876543210", Role.ROLE_ADMIN, "New Delhi", "Connaught Place, Central Delhi");
        admin.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
        userRepository.save(admin);

        // 2. Customers
        User customer1 = new User("Rahul Sharma", "rahul@gmail.com", passwordEncoder.encode("customer123"), "9811223344", Role.ROLE_CUSTOMER, "South Delhi", "B-42, Hauz Khas Enclave, New Delhi");
        customer1.setAvatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80");
        userRepository.save(customer1);

        User customer2 = new User("Priya Deshmukh", "priya@gmail.com", passwordEncoder.encode("customer123"), "9822334455", Role.ROLE_CUSTOMER, "Noida", "Sector 62, Noida, UP");
        customer2.setAvatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80");
        userRepository.save(customer2);

        // Service Categories lookup
        ServiceCategory plumberCat = categoryRepository.findBySlug("plumber").orElse(null);
        ServiceCategory electricianCat = categoryRepository.findBySlug("electrician").orElse(null);
        ServiceCategory carpenterCat = categoryRepository.findBySlug("carpenter").orElse(null);
        ServiceCategory applianceCat = categoryRepository.findBySlug("appliance-repair").orElse(null);
        ServiceCategory painterCat = categoryRepository.findBySlug("painter").orElse(null);

        // 3. Workers
        // Worker 1: Rajesh Sharma - Plumber (Verified)
        User uWorker1 = new User("Rajesh Sharma", "rajesh.plumber@kaamsetu.com", passwordEncoder.encode("worker123"), "9871100221", Role.ROLE_WORKER, "South Delhi", "Malviya Nagar, New Delhi");
        uWorker1.setAvatarUrl("https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80");
        userRepository.save(uWorker1);

        WorkerProfile wp1 = new WorkerProfile();
        wp1.setUser(uWorker1);
        wp1.setCategory(plumberCat);
        wp1.setSkills("Pipe Leakage, Bathroom Sanitary, Tap Replacement, Motor Pump Installation");
        wp1.setBio("Licensed master plumber with 8+ years of field experience across Delhi NCR. Punctual, transparent, and brings own branded equipment.");
        wp1.setExperienceYears(8);
        wp1.setVisitingCharge(199.0);
        wp1.setHourlyRate(249.0);
        wp1.setEmergencyCharge(150.0);
        wp1.setAvailable(true);
        wp1.setVerified(true);
        wp1.setVerificationStatus("VERIFIED");
        wp1.setVerificationNotes("Aadhaar & Trade certification verified by Admin.");
        wp1.setIdProofType("AADHAAR");
        wp1.setIdProofNumber("XXXX-XXXX-8921");
        wp1.setRating(4.9);
        wp1.setTotalReviews(14);
        wp1.setCompletedJobsCount(38);
        wp1.setCity("South Delhi");
        wp1.setServiceArea("Hauz Khas, Malviya Nagar, Saket, Green Park, Greater Kailash");
        wp1.setLatitude(28.5355);
        wp1.setLongitude(77.2100);
        wp1.setCurrentLocationName("Malviya Nagar Main Market, South Delhi");
        wp1.setLastLocationUpdate(LocalDateTime.now().minusMinutes(5));
        workerProfileRepository.save(wp1);

        // Worker 2: Suresh Verma - Electrician (Verified)
        User uWorker2 = new User("Suresh Verma", "suresh.electrician@kaamsetu.com", passwordEncoder.encode("worker123"), "9871100332", Role.ROLE_WORKER, "West Delhi", "Rajouri Garden, New Delhi");
        uWorker2.setAvatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80");
        userRepository.save(uWorker2);

        WorkerProfile wp2 = new WorkerProfile();
        wp2.setUser(uWorker2);
        wp2.setCategory(electricianCat);
        wp2.setSkills("MCB Tripping, Ceiling Fan, Concealed Wiring, Inverter Setup, Geyser Wiring");
        wp2.setBio("Certified electrician specializing in domestic wiring and emergency fault detection. Fast response time within 30 minutes.");
        wp2.setExperienceYears(6);
        wp2.setVisitingCharge(149.0);
        wp2.setHourlyRate(220.0);
        wp2.setEmergencyCharge(120.0);
        wp2.setAvailable(true);
        wp2.setVerified(true);
        wp2.setVerificationStatus("VERIFIED");
        wp2.setVerificationNotes("ITI Electrical diploma and Govt ID verified.");
        wp2.setIdProofType("PAN");
        wp2.setIdProofNumber("ABCDE1234F");
        wp2.setRating(4.8);
        wp2.setTotalReviews(9);
        wp2.setCompletedJobsCount(27);
        wp2.setCity("West Delhi");
        wp2.setServiceArea("Rajouri Garden, Punjabi Bagh, Janakpuri, Tilak Nagar");
        wp2.setLatitude(28.5550);
        wp2.setLongitude(77.2060);
        wp2.setCurrentLocationName("Near Hauz Khas Metro Station, New Delhi");
        wp2.setLastLocationUpdate(LocalDateTime.now().minusMinutes(2));
        workerProfileRepository.save(wp2);

        // Worker 3: Manoj Kumar - Carpenter (Verified)
        User uWorker3 = new User("Manoj Kumar", "manoj.carpenter@kaamsetu.com", passwordEncoder.encode("worker123"), "9871100443", Role.ROLE_WORKER, "Noida", "Sector 18, Noida");
        uWorker3.setAvatarUrl("https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80");
        userRepository.save(uWorker3);

        WorkerProfile wp3 = new WorkerProfile();
        wp3.setUser(uWorker3);
        wp3.setCategory(carpenterCat);
        wp3.setSkills("Custom Wardrobes, Bed Repair, Lock Replacement, Modular Kitchen, Hinges");
        wp3.setBio("10 years creating and restoring solid wood and engineered wood furniture. High accuracy and neat finishing guaranteed.");
        wp3.setExperienceYears(10);
        wp3.setVisitingCharge(249.0);
        wp3.setHourlyRate(350.0);
        wp3.setEmergencyCharge(200.0);
        wp3.setAvailable(true);
        wp3.setVerified(true);
        wp3.setVerificationStatus("VERIFIED");
        wp3.setVerificationNotes("Background check clear. Verified identity.");
        wp3.setIdProofType("VOTER_ID");
        wp3.setIdProofNumber("VTR9920102");
        wp3.setRating(4.7);
        wp3.setTotalReviews(6);
        wp3.setCompletedJobsCount(19);
        wp3.setCity("Noida");
        wp3.setServiceArea("Sector 18, 50, 62, 75, Indirapuram");
        wp3.setLatitude(28.5700);
        wp3.setLongitude(77.3200);
        wp3.setCurrentLocationName("Sector 18 Atta Market, Noida");
        wp3.setLastLocationUpdate(LocalDateTime.now().minusMinutes(12));
        workerProfileRepository.save(wp3);

        // Worker 4: Amit Patel - Appliance Repair (Verified)
        User uWorker4 = new User("Amit Patel", "amit.repair@kaamsetu.com", passwordEncoder.encode("worker123"), "9871100554", Role.ROLE_WORKER, "Gurugram", "DLF Phase 3, Gurugram");
        uWorker4.setAvatarUrl("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80");
        userRepository.save(uWorker4);

        WorkerProfile wp4 = new WorkerProfile();
        wp4.setUser(uWorker4);
        wp4.setCategory(applianceCat);
        wp4.setSkills("Split AC Servicing, PCB Repair, Refrigerator Cooling Fix, Washing Machine Drum Repair");
        wp4.setBio("Ex-authorized brand service technician with genuine spare parts warranty. Honest diagnosis and upfront quotes.");
        wp4.setExperienceYears(5);
        wp4.setVisitingCharge(199.0);
        wp4.setHourlyRate(399.0);
        wp4.setEmergencyCharge(250.0);
        wp4.setAvailable(true);
        wp4.setVerified(true);
        wp4.setVerificationStatus("VERIFIED");
        wp4.setVerificationNotes("HVAC certification verified.");
        wp4.setIdProofType("AADHAAR");
        wp4.setIdProofNumber("XXXX-XXXX-4412");
        wp4.setRating(4.9);
        wp4.setTotalReviews(12);
        wp4.setCompletedJobsCount(41);
        wp4.setCity("Gurugram");
        wp4.setServiceArea("DLF Phase 1-5, Cyber City, Golf Course Road, Sohna Road");
        wp4.setLatitude(28.4900);
        wp4.setLongitude(77.0900);
        wp4.setCurrentLocationName("Cyber Hub, DLF Phase 2, Gurugram");
        wp4.setLastLocationUpdate(LocalDateTime.now().minusMinutes(20));
        workerProfileRepository.save(wp4);

        // Worker 5: Deepak Prajapati - Plumber (Pending Verification - for Admin review)
        User uWorker5 = new User("Deepak Prajapati", "deepak.p@kaamsetu.com", passwordEncoder.encode("worker123"), "9871100665", Role.ROLE_WORKER, "Central Delhi", "Karol Bagh, New Delhi");
        uWorker5.setAvatarUrl("https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80");
        userRepository.save(uWorker5);

        WorkerProfile wp5 = new WorkerProfile();
        wp5.setUser(uWorker5);
        wp5.setCategory(plumberCat);
        wp5.setSkills("Water Tank Cleaning, Tap Fitting, Pipeline Blockage");
        wp5.setBio("Newly joined plumber offering affordable residential plumbing services. Enthusiastic and polite.");
        wp5.setExperienceYears(2);
        wp5.setVisitingCharge(129.0);
        wp5.setHourlyRate(180.0);
        wp5.setEmergencyCharge(100.0);
        wp5.setAvailable(true);
        wp5.setVerified(false);
        wp5.setVerificationStatus("PENDING");
        wp5.setVerificationNotes("Uploaded Aadhaar card. Pending verification by admin.");
        wp5.setIdProofType("AADHAAR");
        wp5.setIdProofNumber("XXXX-XXXX-9911");
        wp5.setRating(5.0);
        wp5.setTotalReviews(0);
        wp5.setCompletedJobsCount(0);
        wp5.setCity("Central Delhi");
        wp5.setServiceArea("Karol Bagh, Patel Nagar, Rajendra Place");
        wp5.setLatitude(28.6517);
        wp5.setLongitude(77.1906);
        wp5.setCurrentLocationName("Karol Bagh Metro Gate 2, New Delhi");
        wp5.setLastLocationUpdate(LocalDateTime.now().minusMinutes(35));
        workerProfileRepository.save(wp5);

        // 4. Seed Bookings & Reviews
        // Booking 1: Completed Job with Review & Worker Reply
        Booking b1 = new Booking();
        b1.setBookingNumber("KS-202611-1001");
        b1.setCustomer(customer1);
        b1.setWorker(wp1);
        b1.setCategory(plumberCat);
        b1.setServiceTitle("Kitchen Sink Pipe Burst & Heavy Leakage");
        b1.setProblemDescription("Water is leaking continuously from under the sink siphon joint whenever the tap is turned on.");
        b1.setScheduledDate(LocalDate.now().minusDays(2));
        b1.setScheduledTimeSlot("10:00 AM - 12:00 PM");
        b1.setAddress(customer1.getAddress());
        b1.setCity(customer1.getCity());
        b1.setContactPhone(customer1.getPhone());
        b1.setUrgency(UrgencyLevel.HIGH);
        b1.setStatus(BookingStatus.COMPLETED);
        b1.setCompletionOtp("5432");
        b1.setVisitingFee(199.0);
        b1.setHourlyRate(249.0);
        b1.setEstimatedHours(1.5);
        b1.setPartsCost(150.0);
        b1.setTotalAmount(199.0 + (249.0 * 1.5) + 150.0); // 722.50
        b1.setPaymentStatus("PAID_CASH");
        b1.setWorkerNotes("Replaced the rusted waste coupling and installed heavy-duty PVC pipe with silicone sealant.");
        b1.setCompletedAt(LocalDateTime.now().minusDays(2).plusHours(2));
        bookingRepository.save(b1);

        Review r1 = new Review(b1, customer1, wp1, 5, "Rajesh arrived within 25 minutes! Extremely courteous, quickly identified the faulty coupling, and fixed it with zero mess. Very reasonable charges!");
        r1.setWorkerReply("Thank you Rahul ji for the kind words! Glad I could help resolve the emergency quickly.");
        reviewRepository.save(r1);

        // Booking 2: IN_PROGRESS Job (with OTP ready for completion demo)
        Booking b2 = new Booking();
        b2.setBookingNumber("KS-202611-1002");
        b2.setCustomer(customer1);
        b2.setWorker(wp2);
        b2.setCategory(electricianCat);
        b2.setServiceTitle("Living Room MCB Frequent Tripping");
        b2.setProblemDescription("The main breaker trips whenever AC and geyser are run together. Need load inspection and circuit check.");
        b2.setScheduledDate(LocalDate.now());
        b2.setScheduledTimeSlot("02:00 PM - 04:00 PM");
        b2.setAddress(customer1.getAddress());
        b2.setCity(customer1.getCity());
        b2.setContactPhone(customer1.getPhone());
        b2.setUrgency(UrgencyLevel.NORMAL);
        b2.setStatus(BookingStatus.IN_PROGRESS);
        b2.setCompletionOtp("4321"); // Customer holds this OTP
        b2.setVisitingFee(149.0);
        b2.setHourlyRate(220.0);
        b2.setEstimatedHours(1.0);
        b2.setPartsCost(0.0);
        b2.setTotalAmount(369.0);
        b2.setPaymentStatus("PENDING");
        b2.setWorkerNotes("Diagnosing circuit load imbalance on phase 2.");
        b2.setCustomerLatitude(28.5494);
        b2.setCustomerLongitude(77.2001);
        b2.setWorkerLatitude(28.5550);
        b2.setWorkerLongitude(77.2060);
        b2.setWorkerLocationName("Near Hauz Khas Metro Station, New Delhi");
        b2.setDistanceKm(0.8);
        b2.setEstimatedArrivalMinutes(4);
        b2.setLastLocationUpdate(LocalDateTime.now().minusMinutes(2));
        bookingRepository.save(b2);

        // Booking 3: PENDING Job (visible on Worker dashboard to accept/reject)
        Booking b3 = new Booking();
        b3.setBookingNumber("KS-202611-1003");
        b3.setCustomer(customer2);
        b3.setWorker(wp1);
        b3.setCategory(plumberCat);
        b3.setServiceTitle("Bathroom Flush Valve Replacement");
        b3.setProblemDescription("Water constantly running in the dual flush tank. Needs internal valve replacement.");
        b3.setScheduledDate(LocalDate.now().plusDays(1));
        b3.setScheduledTimeSlot("11:00 AM - 01:00 PM");
        b3.setAddress(customer2.getAddress());
        b3.setCity(customer2.getCity());
        b3.setContactPhone(customer2.getPhone());
        b3.setUrgency(UrgencyLevel.NORMAL);
        b3.setStatus(BookingStatus.PENDING);
        b3.setCompletionOtp("8872");
        b3.setVisitingFee(199.0);
        b3.setHourlyRate(249.0);
        b3.setEstimatedHours(1.0);
        b3.setPartsCost(0.0);
        b3.setTotalAmount(448.0);
        b3.setPaymentStatus("PENDING");
        b3.setCustomerLatitude(28.6270);
        b3.setCustomerLongitude(77.3620);
        b3.setWorkerLatitude(28.5355);
        b3.setWorkerLongitude(77.2100);
        b3.setWorkerLocationName("Malviya Nagar Main Market, South Delhi");
        b3.setDistanceKm(17.8);
        b3.setEstimatedArrivalMinutes(42);
        b3.setLastLocationUpdate(LocalDateTime.now().minusMinutes(5));
        bookingRepository.save(b3);

        // Seed Sample Chat Messages for active booking b2
        ChatMessage m1 = new ChatMessage(b2, customer1, uWorker2, "Hi Suresh ji, our flat is 402 on the 4th floor. The main circuit breaker is in the balcony.");
        chatMessageRepository.save(m1);

        ChatMessage m2 = new ChatMessage(b2, uWorker2, customer1, "Understood Rahul ji! I have arrived at the society gate and am coming up with multimeters.");
        chatMessageRepository.save(m2);

        // Seed Sample Notifications
        Notification n1 = new Notification(customer1, "Technician On The Way #KS-202611-1002", "Suresh Verma (Electrician) is nearby your location.", "WORK_IN_PROGRESS", "/customer/dashboard");
        Notification n2 = new Notification(uWorker1, "New Booking Request #KS-202611-1003", "Priya Deshmukh requested Bathroom Flush Valve Replacement", "BOOKING_REQUEST", "/worker/dashboard");
        Notification n3 = new Notification(admin, "New Worker Registration Pending", "Deepak Prajapati uploaded Aadhaar documents for KYC verification", "KYC_PENDING", "/admin/dashboard");
        notificationRepository.saveAll(Arrays.asList(n1, n2, n3));
    }
}

