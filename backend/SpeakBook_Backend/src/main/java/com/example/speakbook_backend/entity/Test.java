package com.example.speakbook_backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "student")
public class Test {
    @Id
    private Long id;
    private String name;
    private String email;
    private int age;
}
