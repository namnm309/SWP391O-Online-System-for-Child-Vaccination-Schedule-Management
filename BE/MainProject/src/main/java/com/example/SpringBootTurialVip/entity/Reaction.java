package com.example.SpringBootTurialVip.entity;

import jakarta.persistence.*;
import jdk.jfr.Registered;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "tbl_reaction")
public class Reaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_detail_id", nullable = false)
    private OrderDetail orderDetail;

    @ManyToOne
    @JoinColumn(name = "child_id", referencedColumnName = "user_id", nullable = false)
    private User child;  // Trẻ được ghi nhận phản ứng

    @Column(nullable = false, length = 1000)
    private String symptoms;

    // Ghi chú xử lý từ nhân viên (chỉ staff nhập)
    @Column(length = 1000)
    private String handlingNote;

    // Staff xử lý phản ứng
    @ManyToOne
    @JoinColumn(name = "handled_by")
    private User handledBy;

    private LocalDateTime handledAt;

    @Column(nullable = false)
    private LocalDateTime reportedAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "created_by", referencedColumnName = "user_id", nullable = false)
    private User createdBy;  // Người viết phản ứng (staff hoặc customer)

    @Column(name = "bad_injection", nullable = false)
    private boolean badInjection;



}

