package com.HungHuyTech.backend.user.repository;

import com.HungHuyTech.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    // Thêm phương thức tìm user theo email HOẶC full_name (tên đăng nhập)
    @Query("SELECT u FROM User u WHERE u.email = :identifier OR u.fullName = :identifier")
    Optional<User> findByEmailOrFullName(@Param("identifier") String identifier);
}