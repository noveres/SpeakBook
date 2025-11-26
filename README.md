# Spring Boot 

設定（application.properties）

spring.application.name=SpeakBook_Backend

spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASS}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.properties.hibernate.format_sql=true

spring.servlet.multipart.max-file-size=11MB
spring.servlet.multipart.max-request-size=11MB

server.port=9527