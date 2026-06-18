package com.server.app.dto.finanzas;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransferenciaDto {

    @NotNull(message = "La cuenta origen es obligatoria")
    private Long cuentaOrigenId;

    @NotNull(message = "La cuenta destino es obligatoria")
    private Long cuentaDestinoId;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal monto;

    private String descripcion;
}
