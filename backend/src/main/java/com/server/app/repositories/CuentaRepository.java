package com.server.app.repositories;

import com.server.app.entities.Cuenta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CuentaRepository extends JpaRepository<Cuenta, Long> {

    Page<Cuenta> findByUsuario_Id(Pageable pageable, Integer usuarioId);
}
