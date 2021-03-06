/* 
 * Copyright (C) SWAN (Saar Web-based ANotation system) contributors. All rights reserved.
 * Licensed under the GPLv2 License. See LICENSE in the project root for license information.
 */
package de.unisaarland.swan.dao;

import de.unisaarland.swan.entities.Project;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import javax.persistence.NoResultException;
import javax.persistence.TypedQuery;

/**
 * This DAO (Data Access Object) provides extended CRUD operations for the specified entity type.
 *
 * @author Timo Guehring
 * @param <Entity>
 */
public abstract class BaseEntityDAO<Entity> extends AbstractDAO {
    
    /**
     * The entity class.
     */
    protected final Class<Entity> entityClass;
    
    public BaseEntityDAO(Class<Entity> entityClass) {
        this.entityClass = entityClass;
    }
    
    public Entity find(Object id) {
        return em.find(entityClass, id);
    }
    
    public List<Entity> findAll() {
        return findAll(entityClass);
    }
    
    public Entity find(Object id, boolean optional) {
        Entity result = em.find(entityClass, id);
        if (result == null && !optional) {
            throw new NoResultException("AbstractDAO: Could not find " + entityClass.getCanonicalName());
        } else {
            return result;
        }
    }
    
    protected List<Entity> executeQuery(String queryName) {
        return executeQuery(queryName, Collections.EMPTY_MAP);
    }

    protected List<Entity> executeQuery(String queryName, final int firstResult, final int maxResult) {
        return executeQueryWithPaging(queryName, Collections.EMPTY_MAP, firstResult, maxResult);
    }
    
    protected Entity executeQuery(String queryName, Map<String, ?> parameters, boolean nullOptional) {
        List<Entity> entities = executeQuery(queryName, parameters);
        if (entities.isEmpty()) {
            if (nullOptional) {
                return null;
            } else {
                throw new NoResultException("BaseEntityDAO: Could not find " + entityClass.getCanonicalName());
            }
        } else {
            return firstResult(entities);
        }
    }

    private TypedQuery<Entity> prepareQuery(String queryName, Map<String, ?> parameters) {
        TypedQuery<Entity> query = createNamedQuery(queryName, entityClass);
        for (Map.Entry<String, ?> entry : parameters.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
        return query;
    }
    
    protected List<Entity> executeQuery(String queryName, Map<String, ?> parameters) {
        TypedQuery<Entity> query = prepareQuery(queryName, parameters);
        return query.getResultList();
    }

    protected List<Entity> executeQueryWithPaging(String queryName, Map<String, ?> parameters, final int firstResult, final int maxResult) {
        TypedQuery<Entity> query = prepareQuery(queryName, parameters);
        query.setFirstResult(firstResult);
        query.setMaxResults(maxResult);
        return query.getResultList();
    }

    protected int executeUpdate(String queryName, Map<String, ?> parameters) {
        TypedQuery<Entity> query = prepareQuery(queryName, parameters);
        return query.executeUpdate();
    }
    
}
