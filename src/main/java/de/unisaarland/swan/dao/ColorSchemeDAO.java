/* 
 * Copyright (C) SWAN (Saar Web-based ANotation system) contributors. All rights reserved.
 * Licensed under the GPLv2 License. See LICENSE in the project root for license information.
 */
package de.unisaarland.swan.dao;

import de.unisaarland.swan.entities.ColorScheme;
import javax.ejb.Stateless;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;

/**
 * This DAO (Data Access Object) provides all CRUD operations for colorschemes.
 *
 * @author Julia Dembowski
 */
@Stateless
@TransactionAttribute(TransactionAttributeType.MANDATORY)
public class ColorSchemeDAO extends BaseEntityDAO<ColorScheme> {

    public ColorSchemeDAO() {
        super(ColorScheme.class);
    }

}
