package com.server.app.controllers;

import com.server.app.dto.finanzas.MovimientoDto;
import com.server.app.dto.finanzas.TransferenciaDto;
import com.server.app.dto.response.Pagination;
import com.server.app.dto.response.PaginationMeta;
import com.server.app.entities.Movimiento;
import com.server.app.services.MovimientoService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/finanzas")
public class MovimientoController {

    private final MovimientoService movimientoService;

    public MovimientoController(MovimientoService movimientoService) {
        this.movimientoService = movimientoService;
    }

    @GetMapping("/movimientos")
    public ResponseEntity<Pagination<Movimiento>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam Long cuentaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin) {

        Page<Movimiento> p = movimientoService.findAll(page, size, cuentaId, fechaInicio, fechaFin);

        return ResponseEntity.ok(new Pagination<>(
                p.getContent(),
                new PaginationMeta(p.getNumber(), p.getSize(), p.getTotalPages(), p.getTotalElements())
        ));
    }

    @PostMapping("/movimientos")
    public ResponseEntity<Movimiento> create(@Valid @RequestBody MovimientoDto dto) {
        return ResponseEntity.ok(movimientoService.create(dto));
    }

    @PostMapping("/transferencias")
    public ResponseEntity<Void> transferencia(@Valid @RequestBody TransferenciaDto dto) {
        movimientoService.transferencia(dto);
        return ResponseEntity.ok().build();
    }
}
