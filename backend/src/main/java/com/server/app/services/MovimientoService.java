package com.server.app.services;

import com.server.app.dto.finanzas.MovimientoDto;
import com.server.app.dto.finanzas.TransferenciaDto;
import com.server.app.entities.Categoria;
import com.server.app.entities.Cuenta;
import com.server.app.entities.Movimiento;
import com.server.app.exceptions.BadRequestException;
import com.server.app.exceptions.NotFoundException;
import com.server.app.repositories.CategoriaRepository;
import com.server.app.repositories.CuentaRepository;
import com.server.app.repositories.MovimientoRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class MovimientoService {

    private final MovimientoRepository movimientoRepository;
    private final CuentaRepository cuentaRepository;
    private final CategoriaRepository categoriaRepository;

    public Page<Movimiento> findAll(int page, int size, Long cuentaId, LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return movimientoRepository.findByCuentaAndFecha(
                PageRequest.of(page, size), cuentaId, fechaInicio, fechaFin
        );
    }

    @Transactional
    public Movimiento create(MovimientoDto dto) {
        Cuenta cuenta = cuentaRepository.findById(dto.getCuentaId())
                .orElseThrow(() -> new NotFoundException("Cuenta no encontrada"));

        Movimiento movimiento = new Movimiento();
        movimiento.setMonto(dto.getMonto());
        movimiento.setMonedaOriginal(dto.getMonedaOriginal());
        movimiento.setTasaCambio(dto.getTasaCambio());
        movimiento.setFecha(dto.getFecha() != null ? dto.getFecha() : LocalDateTime.now());
        movimiento.setDescripcion(dto.getDescripcion());
        movimiento.setCuenta(cuenta);

        if (dto.getCategoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                    .orElseThrow(() -> new NotFoundException("Categoría no encontrada"));
            movimiento.setCategoria(categoria);
        }

        return movimientoRepository.save(movimiento);
    }

    @Transactional
    public void transferencia(TransferenciaDto dto) {
        Cuenta origen = cuentaRepository.findById(dto.getCuentaOrigenId())
                .orElseThrow(() -> new NotFoundException("Cuenta origen no encontrada"));
        Cuenta destino = cuentaRepository.findById(dto.getCuentaDestinoId())
                .orElseThrow(() -> new NotFoundException("Cuenta destino no encontrada"));

        if (origen.getSaldoBase().compareTo(dto.getMonto()) < 0) {
            throw new BadRequestException("Saldo insuficiente en la cuenta origen");
        }

        origen.setSaldoBase(origen.getSaldoBase().subtract(dto.getMonto()));
        destino.setSaldoBase(destino.getSaldoBase().add(dto.getMonto()));
        cuentaRepository.save(origen);
        cuentaRepository.save(destino);

        String descripcion = dto.getDescripcion();

        Movimiento salida = new Movimiento();
        salida.setMonto(dto.getMonto());
        salida.setMonedaOriginal(origen.getMoneda());
        salida.setTasaCambio(BigDecimal.ONE);
        salida.setFecha(LocalDateTime.now());
        salida.setDescripcion(descripcion != null ? descripcion : "Transferencia saliente");
        salida.setCuenta(origen);

        Movimiento entrada = new Movimiento();
        entrada.setMonto(dto.getMonto());
        entrada.setMonedaOriginal(destino.getMoneda());
        entrada.setTasaCambio(BigDecimal.ONE);
        entrada.setFecha(LocalDateTime.now());
        entrada.setDescripcion(descripcion != null ? descripcion : "Transferencia entrante");
        entrada.setCuenta(destino);

        movimientoRepository.save(salida);
        movimientoRepository.save(entrada);
    }
}
