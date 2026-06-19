package com.server.app.repositories;

import com.server.app.entities.Movimiento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {

    @Query("SELECT m FROM Movimiento m WHERE m.cuenta.id = :cuentaId " +
            "AND m.fecha >= :fechaInicio AND m.fecha <= :fechaFin " +
            "ORDER BY m.fecha DESC")
    Page<Movimiento> findByCuentaAndFecha(
            Pageable pageable,
            @Param("cuentaId") Long cuentaId,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin
    );
}
