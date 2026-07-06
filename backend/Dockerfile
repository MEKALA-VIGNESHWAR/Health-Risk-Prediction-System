# --- Build Stage ---
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

COPY .mvn .mvn
COPY mvnw pom.xml ./

RUN chmod +x mvnw && ./mvnw dependency:resolve -B

COPY src src

# Backend-only image (frontend is served separately, e.g. by nginx),
# so skip the React build here.
RUN ./mvnw clean package -DskipTests -B -Dskip.frontend=true


# --- Runtime Stage ---
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-Xmx300m","-jar","app.jar"]