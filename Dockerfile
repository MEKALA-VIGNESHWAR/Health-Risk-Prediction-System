# --- Build Stage ---
# Use a glibc-based JDK (not alpine/musl) so the Maven-driven Node build works.
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# Copy the entire project so maven can find both frontend and backend
COPY . .

# Run maven from the backend directory where pom.xml is located.
# This also builds the React frontend (via frontend-maven-plugin) into
# ../frontend/dist and bundles it into the JAR's static/ folder.
WORKDIR /app/backend
RUN chmod +x mvnw && ./mvnw clean package -DskipTests -Dskip.frontend=false -B


# --- Runtime Stage ---
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=builder /app/backend/target/*.jar app.jar

# Copy the data folder containing ML CSV files for KNN model
COPY --from=builder /app/data /app/data

EXPOSE 8080

ENTRYPOINT ["java", "-Xmx300m", "-jar", "app.jar"]
