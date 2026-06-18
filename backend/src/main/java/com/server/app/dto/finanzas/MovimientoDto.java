package com.server.app.dto.finanzas;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class MovimientoDto {

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal monto;

    @NotBlank(message = "La moneda original es obligatoria")
    private String monedaOriginal;

    private BigDecimal tasaCambio;

    private LocalDateTime fecha;

    private String descripcion;

    @NotNull(message = "La cuenta es obligatoria")
    private Long cuentaId;

    private Long categoriaId;
}
