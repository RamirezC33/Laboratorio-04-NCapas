package com.server.app.services;

import com.server.app.entities.Categoria;
import com.server.app.repositories.CategoriaRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public Page<Categoria> findAll(int page, int size) {
        return categoriaRepository.findAll(PageRequest.of(page, size));
    }
}
