package com.server.app.dto.finanzas;

import com.server.app.entities.TipoCuenta;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CuentaDto {

    @NotBlank(message = "El alias es obligatorio")
    private String alias;

    @NotBlank(message = "La moneda es obligatoria")
    private String moneda;

    @NotNull(message = "El saldo base es obligatorio")
    @DecimalMin(value = "0.0", inclusive = true, message = "El saldo base no puede ser negativo")
    private BigDecimal saldoBase;

    @NotNull(message = "El tipo de cuenta es obligatorio")
    private TipoCuenta tipo;
}
