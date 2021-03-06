/*
 * Copyright (C) SWAN (Saar Web-based ANotation system) contributors. All rights reserved.
 * Licensed under the GPLv2 License. See LICENSE in the project root for license information.
 */
'use strict';

class Label {
    id: number;
    name: string;
    labelSet: LabelSet;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
    
    public setLabelSet(labelSet: LabelSet) {
        this.labelSet = labelSet;
    };
}
