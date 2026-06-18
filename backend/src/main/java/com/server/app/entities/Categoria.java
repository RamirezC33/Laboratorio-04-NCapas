package com.server.app.entities;

import jakarta.persistence.*;
import lombok.*;

@Table(name = "categorias")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoCategoria tipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_padre_id", nullable = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Categoria categoriaPadre;
}
