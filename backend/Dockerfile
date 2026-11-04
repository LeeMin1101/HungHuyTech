# Bước 1: Môi trường build sử dụng Maven và Java 17
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
# Copy toàn bộ mã nguồn vào container
COPY . .
# Cấp quyền thực thi cho Maven Wrapper và tiến hành build (bỏ qua Test)
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Bước 2: Môi trường chạy (Runtime) cực nhẹ với Java 17
FROM eclipse-temurin:17-jre
WORKDIR /app
# Copy file .jar đã build từ bước 1 sang
COPY --from=build /app/target/*.jar app.jar
# Mở port 8081 (khớp với port cấu hình trong application.yml)
EXPOSE 8081
# Lệnh khởi chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]