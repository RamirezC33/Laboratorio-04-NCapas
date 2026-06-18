package com.server.app.services;

import com.server.app.config.JsonWebToken;
import com.server.app.dto.finanzas.CuentaDto;
import com.server.app.entities.Cuenta;
import com.server.app.entities.User;
import com.server.app.exceptions.NotFoundException;
import com.server.app.repositories.CuentaRepository;
import com.server.app.repositories.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class CuentaService {

    private final CuentaRepository cuentaRepository;
    private final UserRepository userRepository;
    private final JsonWebToken jwt;

    public Page<Cuenta> findAll(int page, int size, String token) {
        Integer userId = jwt.extractIdUser(token);
        return cuentaRepository.findByUsuario_Id(PageRequest.of(page, size), userId);
    }

    @Transactional
    public Cuenta create(CuentaDto dto, String token) {
        Integer userId = jwt.extractIdUser(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        Cuenta cuenta = new Cuenta();
        cuenta.setAlias(dto.getAlias());
        cuenta.setMoneda(dto.getMoneda());
        cuenta.setSaldoBase(dto.getSaldoBase());
        cuenta.setTipo(dto.getTipo());
        cuenta.setUsuario(user);

        return cuentaRepository.save(cuenta);
    }

    public Cuenta findById(Long id) {
        return cuentaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cuenta no encontrada"));
    }
}
