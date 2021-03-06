/* 
 * Copyright (C) SWAN (Saar Web-based ANotation system) contributors. All rights reserved.
 * Licensed under the GPLv2 License. See LICENSE in the project root for license information.
 */
package de.unisaarland.swan.dao;

import de.unisaarland.swan.entities.Scheme;
import de.unisaarland.swan.entities.Users;

import javax.ejb.Stateless;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import java.util.Collections;
import java.util.List;

/**
 * This DAO (Data Access Object) provides all CRUD operations for schemes.
 *
 * @author Timo Guehring
 */
@Stateless
@TransactionAttribute(TransactionAttributeType.MANDATORY)
public class SchemeDAO extends BaseEntityDAO<Scheme> {
    
    public SchemeDAO() {
        super(Scheme.class);
    }

    @Override
    public List<Scheme> findAll() {
        return executeQuery(Scheme.QUERY_FIND_ALL);
    }

    public Scheme find(final Long schemeId) {
        return firstResult(
                    executeQuery(
                        Scheme.QUERY_FIND_BY_ID,
                        Collections.singletonMap(Scheme.PARAM_ID, schemeId)));
    }

    public Scheme getSchemeByDocId(final Long docId) {
        return firstResult(
                executeQuery(
                        Scheme.QUERY_FIND_BY_DOC_ID,
                        Collections.singletonMap(Scheme.PARAM_DOC_ID, docId)));
    }

    public void setCreatorInSchemeNull(Users user) {
        executeUpdate(
                Scheme.QUERY_SET_CREATOR_NULL,
                Collections.singletonMap(Scheme.PARAM_CREATOR, user));
    }
    
}
