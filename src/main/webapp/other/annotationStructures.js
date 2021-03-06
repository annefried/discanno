/*
 * Copyright (C) SWAN (Saar Web-based ANotation system) contributors. All rights reserved.
 * Licensed under the GPLv2 License. See LICENSE in the project root for license information.
 */
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AnnotationMode = (function () {
    function AnnotationMode() {
    }
    AnnotationMode.Everything = "Everything";
    AnnotationMode.Nothing = "Nothing";
    return AnnotationMode;
}());
;
//Represents a whole line in the text
var TextLine = (function () {
    function TextLine(start, end) {
        this.start = start;
        this.end = end;
        this.words = [];
    }
    return TextLine;
}());
//Represents a single text in the text
var TextWord = (function () {
    function TextWord(text, start, end) {
        this.text = text;
        this.start = start;
        this.end = end;
        this.annotatedBy = 0;
        this.lineIndex = 0;
        this.wordIndex = 0;
    }
    TextWord.prototype.setIndices = function (lineIndex, wordIndex) {
        this.lineIndex = lineIndex;
        this.wordIndex = wordIndex;
    };
    ;
    return TextWord;
}());
var AnnoType = (function () {
    function AnnoType() {
    }
    AnnoType.Annotation = "Annotation";
    AnnoType.Target = "Target";
    AnnoType.Link = "Link";
    return AnnoType;
}());
;
//Base class for annotations, targets & links
var AnnotationObject = (function () {
    function AnnotationObject(id, type, labels, text) {
        if (labels === void 0) { labels = {}; }
        if (text === void 0) { text = ""; }
        this.id = id;
        this.type = type;
        this.selectableLabels = labels;
        this.text = text;
        this.activeLabels = {};
    }
    //Add a possible label that this object can be labelled with
    AnnotationObject.prototype.addSelectableLabel = function (labelSet) {
        if (labelSet !== undefined)
            this.selectableLabels[labelSet.id] = labelSet;
    };
    ;
    //Remove a possible label that this object can be labelled with
    AnnotationObject.prototype.removeSelectableLabel = function (labelSet) {
        if (labelSet !== undefined) {
            delete this.selectableLabels[labelSet.id];
        }
    };
    ;
    //Checks if this object has this label
    AnnotationObject.prototype.isLabeled = function (labelSet, label) {
        if (this.selectableLabels[labelSet.id] !== undefined) {
            var labels = this.activeLabels[labelSet.id];
            if (labels !== undefined) {
                for (var i = 0; i < labels.length; i++) {
                    if (labels[i].setID === label.setID && labels[i].name === label.name) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    ;
    //Sets a label for this object. If this object already has this label, the label
    //is removed; added otherwise
    AnnotationObject.prototype.setLabel = function (labelSet, label) {
        if (labelSet == undefined || label == undefined) {
            throw "annotationStructure: labelSet or label undefined";
        }
        var set = this.selectableLabels[labelSet.id];
        //Check if this object can be labeled with the set
        if (set !== undefined) {
            if (this.activeLabels[set.id] === undefined)
                this.activeLabels[set.id] = [];
            //Check if the object already has this label
            //and remove it in that case
            var removed = this.removeLabel(labelSet, label);
            if (set.exclusive) {
                this.activeLabels[set.id] = [];
                if (!removed) {
                    this.activeLabels[set.id].push(label);
                }
                else {
                    delete this.activeLabels[set.id];
                }
            }
            else {
                if (!removed) {
                    this.activeLabels[set.id].push(label);
                }
                else {
                    if (this.activeLabels[set.id].length === 0)
                        delete this.activeLabels[set.id];
                }
            }
        }
    };
    ;
    //Removes a label from this objects
    AnnotationObject.prototype.removeLabel = function (labelSet, label) {
        if (this.selectableLabels[labelSet.id] !== undefined) {
            var labels = this.activeLabels[labelSet.id];
            if (labels !== undefined) {
                for (var i = 0; i < labels.length; i++) {
                    if (labels[i].name === label.name && labels[i].setID === label.setID) {
                        this.activeLabels[labelSet.id].splice(i, 1);
                        return true;
                    }
                }
            }
        }
        return false;
    };
    ;
    //Shorten and return the text representation of all the labels depending of the text length
    AnnotationObject.prototype.shortenLabels = function (textLength) {
        var t = "";
        var labels = [];
        for (var id in this.activeLabels) {
            var labelSet = this.activeLabels[id];
            for (var i = 0; i < labelSet.length; i++)
                labels.push(labelSet[i]);
        }
        if (labels.length > textLength) {
            for (var a = 0; a < textLength - 2; a++) {
                var letter = labels[a].name[0];
                t += letter + " ";
            }
            t += "..";
        }
        else {
            //Compute space that each label has
            var space = Math.floor(textLength / labels.length);
            for (var j = 0; j < labels.length; j++) {
                var name = labels[j].name;
                t += name.substring(0, space) + " ";
            }
        }
        return t;
    };
    ;
    return AnnotationObject;
}());
//Represents a whole annotation
var Annotation = (function (_super) {
    __extends(Annotation, _super);
    function Annotation(color, id, sType) {
        if (sType === void 0) { sType = null; }
        if (sType === null) {
            _super.call(this, id, AnnoType.Annotation);
        }
        else {
            _super.call(this, id, AnnoType.Annotation, sType.selectableLabels);
        }
        this.text = "";
        this.sType = sType;
        this.color = color;
        this.words = [];
        this.notSure = false;
    }
    Annotation.prototype.addWord = function (word) {
        word.annotatedBy++;
        this.words.push(word);
        this.text += word.text;
    };
    ;
    Annotation.prototype.addWordBefore = function (word) {
        word.annotatedBy++;
        var words = [];
        this.text = "";
        words.push(word);
        this.text += word.text;
        for (var i = 0; i < this.words.length; i++) {
            words.push(this.words[i]);
            this.text += this.words[i].text;
        }
        this.words = words;
    };
    ;
    //Should be called when the annotation is being removed
    Annotation.prototype.onDelete = function () {
        for (var i = 0; i < this.words.length; i++)
            this.words[i].annotatedBy--;
    };
    ;
    //Removes the last word
    Annotation.prototype.removeLastWord = function () {
        if (this.words.length > 1) {
            var word = this.words.pop();
            word.annotatedBy--;
            var start = this.text.lastIndexOf(word.text);
            this.text = this.text.substring(0, start);
        }
        return word;
    };
    ;
    Annotation.prototype.removeFirstWord = function () {
        if (this.words.length > 1) {
            var word = this.words[0];
            var words = [];
            for (var i = 1; i < this.words.length; i++) {
                words.push(this.words[i]);
            }
            this.words = words;
            this.text = this.text.substring(word.text.length, this.text.length);
        }
        return word;
    };
    ;
    //Remove all words from this annotation
    Annotation.prototype.resetWords = function () {
        this.words = [];
        this.text = "";
    };
    ;
    Annotation.prototype.setSpanType = function (spanType) {
        this.sType = spanType;
        this.selectableLabels = spanType.selectableLabels;
        this.activeLabels = {};
    };
    ;
    Annotation.prototype.getSpanType = function () {
        return this.sType;
    };
    ;
    //Return the text index where this annotation starts
    Annotation.prototype.startIndex = function () {
        if (this.words.length > 0)
            return this.words[0].start;
    };
    ;
    //Returns the text index where this annotation ends
    Annotation.prototype.endIndex = function () {
        if (this.words.length > 0)
            return this.words[this.words.length - 1].end;
    };
    ;
    Annotation.prototype.toString = function (maxSize) {
        if (this.text.length > maxSize)
            return "'" + this.text.substring(0, maxSize - 1) + " ...'";
        return this.text;
    };
    ;
    //Split the text represantion in several lines. The size of each line is
    //capped by maxSize
    Annotation.prototype.toStringLines = function (maxSize) {
        return [this.toString(maxSize)];
    };
    ;
    return Annotation;
}(AnnotationObject));
//Represents a (directed) link between two annotations
var AnnotationLink = (function (_super) {
    __extends(AnnotationLink, _super);
    function AnnotationLink(id, source, target, labels) {
        _super.call(this, id, AnnoType.Link, labels);
        this.source = source;
        this.target = target;
    }
    AnnotationLink.prototype.toString = function () {
        var text = "";
        for (var id in this.activeLabels) {
            var label = this.activeLabels[id];
            if (label.length > 0)
                text += label[0].name + " ";
        }
        return (text === "") ? "click here to add label" : text;
    };
    ;
    AnnotationLink.prototype.toStringLines = function (maxSize) {
        return ["Source ", this.source.toString(maxSize / 2), " => ", "Target ", this.target.toString(maxSize / 2)];
    };
    ;
    return AnnotationLink;
}(AnnotationObject));
//Represents all annotations as graph with all the annotations as nodes
//and all their relations as links
var AnnotationGraph = (function () {
    function AnnotationGraph() {
        this.nodes = [];
        this.links = [];
    }
    return AnnotationGraph;
}());
//Represents a color that is associated with a
//specific annotation type
var AnnotationColor = (function () {
    function AnnotationColor(name, num, shades, back, line) {
        this.name = name;
        this.num = num;
        this.shades = shades;
        this.back = back;
        this.line = (line === undefined) ? back : line;
    }
    AnnotationColor.prototype.fill = function () {
        var mod = this.num % this.shades.length;
        if (this.num !== 0 && mod === 0) {
            mod = (this.num + 1) % this.shades.length; //TODO better solution needed
        }
        return this.shades[mod];
    };
    ;
    return AnnotationColor;
}());
//Represents the label of an annotation (also for linkLabels)
var AnnotationLabel = (function () {
    function AnnotationLabel(id, name, options, setID) {
        this.id = id;
        this.name = name;
        this.options = options;
        this.setID = setID;
    }
    AnnotationLabel.prototype.toString = function (maxSize) {
        if (this.name.length <= maxSize) {
            return this.name;
        }
        return this.name.substring(0, maxSize - 3) + "...";
    };
    ;
    AnnotationLabel.prototype.toStringWithOptionsString = function (maxSize) {
        var text = this.name;
        //If the label text is already too long
        if (text.length >= maxSize) {
            //If only one option is defined, only take the first character
            if (this.options.length === 1) {
                text = text.substring(0, maxSize - 3) + "..." + "[" + this.options[0][0] + "]";
            }
            else {
                text = text.substring(0, maxSize - 3) + "..." + "[" + this.options[0][0] + ",...]";
            }
        }
        else {
            if (this.options.length > 0) {
                var optText = this.options.toString();
                if (text.length + optText.length >= maxSize) {
                    text += "[" + optText;
                    text = text.substring(0, maxSize - 3) + "...]";
                }
                else {
                    text += "[" + optText + "]";
                }
            }
        }
        return text;
    };
    ;
    return AnnotationLabel;
}());
//Represents a LabelSet or LinkType
var AnnotationLabelSet = (function () {
    function AnnotationLabelSet(id, name, exclusive, labels) {
        if (labels === void 0) { labels = []; }
        this.id = id;
        this.name = name;
        this.exclusive = exclusive;
        this.labels = labels;
    }
    AnnotationLabelSet.prototype.addLabel = function (label) {
        if (label === undefined)
            throw "LabelSet: label undefined";
        this.labels.push(label);
    };
    ;
    return AnnotationLabelSet;
}());
//Represents a SpanType
var AnnotationSpanType = (function () {
    function AnnotationSpanType(id, name) {
        this.selectableLabels = {};
        this.id = id;
        this.name = name;
    }
    AnnotationSpanType.prototype.addSelectableLabel = function (labelSet) {
        if (labelSet !== undefined)
            this.selectableLabels[labelSet.id] = labelSet;
    };
    ;
    return AnnotationSpanType;
}());
//Represents the formatted version of a word in the text
var formTextWord = (function () {
    function formTextWord(word, element, x, y, lX, lY, width, height) {
        this.word = word;
        this.element = element;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = (height === undefined) ? 0 : height;
        this.maxAnnotations = 0;
        this.annoGrid = {};
        this.lX = lX;
        this.lY = lY;
        this.id = 0.5 * (this.lX + this.lY) * (this.lX + this.lY + 1) + this.lY;
    }
    formTextWord.prototype.clearAnnotationGrid = function () {
        this.annoGrid = {};
    };
    ;
    return formTextWord;
}());
//Represents the formatted version of an annotation in the text
var formAnnotation = (function () {
    function formAnnotation(annotation, isTarget) {
        this.annotation = annotation;
        this.annotationBoxes = [];
        this.isTarget = (isTarget !== undefined) ? isTarget : false;
    }
    formAnnotation.prototype.addBox = function (annotationBox) {
        annotationBox.isTarget = this.isTarget;
        this.annotationBoxes.push(annotationBox);
    };
    ;
    formAnnotation.prototype.clearAnnotationGrids = function () {
        for (var i = 0; i < this.annotationBoxes.length; i++)
            this.annotationBoxes[i].clearAnnotationGrids();
    };
    ;
    formAnnotation.prototype.startLine = function () {
        if (this.annotationBoxes.length > 0) {
            var annotationBox = this.annotationBoxes[0];
            if (annotationBox.formWords.length > 0) {
                var formWord = annotationBox.formWords[0];
                return formWord.lY;
            }
        }
    };
    ;
    formAnnotation.prototype.endLine = function () {
        if (this.annotationBoxes.length > 0) {
            var annotationBox = this.annotationBoxes[this.annotationBoxes.length - 1];
            if (annotationBox.formWords.length > 0) {
                var formWord = annotationBox.formWords[0];
                return formWord.lY;
            }
        }
    };
    ;
    return formAnnotation;
}());
//Represents the part of a formatted annotation of one line on the screen
var AnnotationBox = (function () {
    function AnnotationBox(annotation) {
        this.annotation = annotation;
        this.height = 0;
        this.formWords = [];
        this.isTarget = false;
    }
    AnnotationBox.prototype.addWord = function (word) {
        this.formWords.push(word);
    };
    ;
    AnnotationBox.prototype.clearAnnotationGrids = function () {
        for (var i = 0; i < this.formWords.length; i++)
            this.formWords[i].clearAnnotationGrid();
    };
    ;
    return AnnotationBox;
}());
//Represents the prefix of each line in the formatted text
var linePrefix = (function () {
    function linePrefix(prefix, height, line) {
        this.prefix = prefix;
        this.height = height;
        this.line = line;
    }
    return linePrefix;
}());
//# sourceMappingURL=annotationStructures.js.map