# --- Build Stage ---
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

COPY .mvn .mvn
COPY mvnw pom.xml ./

RUN chmod +x mvnw && ./mvnw dependency:resolve -B

COPY src src
COPY ../frontend ../frontend

# Build full monolithic application with React frontend bundled into static/
RUN ./mvnw clean package -DskipTests -B -Dskip.frontend=false


# --- Runtime Stage ---
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-Xmx300m","-jar","app.jar"]