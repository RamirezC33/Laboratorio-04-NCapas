package com.server.app.controllers;

import com.server.app.dto.finanzas.CuentaDto;
import com.server.app.dto.response.Pagination;
import com.server.app.dto.response.PaginationMeta;
import com.server.app.entities.Cuenta;
import com.server.app.services.CuentaService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/finanzas/cuentas")
public class CuentaController {

    private final CuentaService cuentaService;

    public CuentaController(CuentaService cuentaService) {
        this.cuentaService = cuentaService;
    }

    @GetMapping
    public ResponseEntity<Pagination<Cuenta>> findAll(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        String token = authHeader.substring(7);
        Page<Cuenta> p = cuentaService.findAll(page, size, token);

        return ResponseEntity.ok(new Pagination<>(
                p.getContent(),
                new PaginationMeta(p.getNumber(), p.getSize(), p.getTotalPages(), p.getTotalElements())
        ));
    }

    @PostMapping
    public ResponseEntity<Cuenta> create(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CuentaDto dto) {

        String token = authHeader.substring(7);
        return ResponseEntity.ok(cuentaService.create(dto, token));
    }
}
