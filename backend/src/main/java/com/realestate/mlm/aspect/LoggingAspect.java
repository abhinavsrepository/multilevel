package com.realestate.mlm.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * AOP Logging Aspect for comprehensive logging across service and controller layers
 * Provides automatic logging of method entry, exit, exceptions, and execution time
 */
@Aspect
@Component
@Slf4j
public class LoggingAspect {

    /**
     * Pointcut for all service methods
     */
    @Pointcut("within(com.realestate.mlm.service..*)")
    public void serviceLayer() {
    }

    /**
     * Pointcut for all controller methods
     */
    @Pointcut("within(com.realestate.mlm.controller..*)")
    public void controllerLayer() {
    }

    /**
     * Pointcut for all repository methods
     */
    @Pointcut("within(com.realestate.mlm.repository..*)")
    public void repositoryLayer() {
    }

    /**
     * Log method entry for service and controller layers
     */
    @Before("serviceLayer() || controllerLayer()")
    public void logMethodEntry(JoinPoint joinPoint) {
        String className = joinPoint.getSignature().getDeclaringTypeName();
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();

        log.debug("→ Entering: {}.{}() with arguments: {}",
                className.substring(className.lastIndexOf('.') + 1),
                methodName,
                Arrays.toString(args));
    }

    /**
     * Log method execution with execution time for critical operations
     */
    @Around("serviceLayer()")
    public Object logMethodExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getSignature().getDeclaringTypeName();
        String methodName = joinPoint.getSignature().getName();

        long startTime = System.currentTimeMillis();

        try {
            Object result = joinPoint.proceed();
            long executionTime = System.currentTimeMillis() - startTime;

            log.debug("← Exiting: {}.{}() - Execution time: {}ms",
                    className.substring(className.lastIndexOf('.') + 1),
                    methodName,
                    executionTime);

            // Warn if execution takes too long (more than 3 seconds)
            if (executionTime > 3000) {
                log.warn("⚠ Slow method execution: {}.{}() took {}ms",
                        className.substring(className.lastIndexOf('.') + 1),
                        methodName,
                        executionTime);
            }

            return result;
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("✗ Exception in {}.{}() after {}ms: {}",
                    className.substring(className.lastIndexOf('.') + 1),
                    methodName,
                    executionTime,
                    e.getMessage());
            throw e;
        }
    }

    /**
     * Log exceptions thrown from service and controller layers
     */
    @AfterThrowing(pointcut = "serviceLayer() || controllerLayer()", throwing = "exception")
    public void logException(JoinPoint joinPoint, Throwable exception) {
        String className = joinPoint.getSignature().getDeclaringTypeName();
        String methodName = joinPoint.getSignature().getName();

        log.error("✗ Exception thrown from {}.{}(): {} - {}",
                className.substring(className.lastIndexOf('.') + 1),
                methodName,
                exception.getClass().getSimpleName(),
                exception.getMessage(),
                exception);
    }

    /**
     * Log successful method completion for critical transactional operations
     */
    @AfterReturning(pointcut = "serviceLayer() && @annotation(org.springframework.transaction.annotation.Transactional)",
            returning = "result")
    public void logTransactionalSuccess(JoinPoint joinPoint, Object result) {
        String className = joinPoint.getSignature().getDeclaringTypeName();
        String methodName = joinPoint.getSignature().getName();

        log.debug("✓ Transaction completed successfully: {}.{}()",
                className.substring(className.lastIndexOf('.') + 1),
                methodName);
    }
}
