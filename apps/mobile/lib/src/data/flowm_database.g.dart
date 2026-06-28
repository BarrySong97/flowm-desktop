// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'flowm_database.dart';

// ignore_for_file: type=lint
class $CategoriesTable extends Categories
    with TableInfo<$CategoriesTable, CategoryRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $CategoriesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _parentIdMeta = const VerificationMeta(
    'parentId',
  );
  @override
  late final GeneratedColumn<String> parentId = GeneratedColumn<String>(
    'parent_id',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _categoryKindMeta = const VerificationMeta(
    'categoryKind',
  );
  @override
  late final GeneratedColumn<String> categoryKind = GeneratedColumn<String>(
    'category_kind',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _colorMeta = const VerificationMeta('color');
  @override
  late final GeneratedColumn<String> color = GeneratedColumn<String>(
    'color',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _iconMeta = const VerificationMeta('icon');
  @override
  late final GeneratedColumn<String> icon = GeneratedColumn<String>(
    'icon',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _displayOrderMeta = const VerificationMeta(
    'displayOrder',
  );
  @override
  late final GeneratedColumn<int> displayOrder = GeneratedColumn<int>(
    'display_order',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _archivedAtMeta = const VerificationMeta(
    'archivedAt',
  );
  @override
  late final GeneratedColumn<String> archivedAt = GeneratedColumn<String>(
    'archived_at',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<String> createdAt = GeneratedColumn<String>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<String> updatedAt = GeneratedColumn<String>(
    'updated_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    name,
    parentId,
    categoryKind,
    color,
    icon,
    displayOrder,
    archivedAt,
    createdAt,
    updatedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'categories';
  @override
  VerificationContext validateIntegrity(
    Insertable<CategoryRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('parent_id')) {
      context.handle(
        _parentIdMeta,
        parentId.isAcceptableOrUnknown(data['parent_id']!, _parentIdMeta),
      );
    }
    if (data.containsKey('category_kind')) {
      context.handle(
        _categoryKindMeta,
        categoryKind.isAcceptableOrUnknown(
          data['category_kind']!,
          _categoryKindMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_categoryKindMeta);
    }
    if (data.containsKey('color')) {
      context.handle(
        _colorMeta,
        color.isAcceptableOrUnknown(data['color']!, _colorMeta),
      );
    }
    if (data.containsKey('icon')) {
      context.handle(
        _iconMeta,
        icon.isAcceptableOrUnknown(data['icon']!, _iconMeta),
      );
    }
    if (data.containsKey('display_order')) {
      context.handle(
        _displayOrderMeta,
        displayOrder.isAcceptableOrUnknown(
          data['display_order']!,
          _displayOrderMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_displayOrderMeta);
    }
    if (data.containsKey('archived_at')) {
      context.handle(
        _archivedAtMeta,
        archivedAt.isAcceptableOrUnknown(data['archived_at']!, _archivedAtMeta),
      );
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  CategoryRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return CategoryRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      parentId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}parent_id'],
      ),
      categoryKind: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}category_kind'],
      )!,
      color: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}color'],
      ),
      icon: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}icon'],
      ),
      displayOrder: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}display_order'],
      )!,
      archivedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}archived_at'],
      ),
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}created_at'],
      )!,
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}updated_at'],
      )!,
    );
  }

  @override
  $CategoriesTable createAlias(String alias) {
    return $CategoriesTable(attachedDatabase, alias);
  }
}

class CategoryRow extends DataClass implements Insertable<CategoryRow> {
  final String id;
  final String name;
  final String? parentId;
  final String categoryKind;
  final String? color;
  final String? icon;
  final int displayOrder;
  final String? archivedAt;
  final String createdAt;
  final String updatedAt;
  const CategoryRow({
    required this.id,
    required this.name,
    this.parentId,
    required this.categoryKind,
    this.color,
    this.icon,
    required this.displayOrder,
    this.archivedAt,
    required this.createdAt,
    required this.updatedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['name'] = Variable<String>(name);
    if (!nullToAbsent || parentId != null) {
      map['parent_id'] = Variable<String>(parentId);
    }
    map['category_kind'] = Variable<String>(categoryKind);
    if (!nullToAbsent || color != null) {
      map['color'] = Variable<String>(color);
    }
    if (!nullToAbsent || icon != null) {
      map['icon'] = Variable<String>(icon);
    }
    map['display_order'] = Variable<int>(displayOrder);
    if (!nullToAbsent || archivedAt != null) {
      map['archived_at'] = Variable<String>(archivedAt);
    }
    map['created_at'] = Variable<String>(createdAt);
    map['updated_at'] = Variable<String>(updatedAt);
    return map;
  }

  CategoriesCompanion toCompanion(bool nullToAbsent) {
    return CategoriesCompanion(
      id: Value(id),
      name: Value(name),
      parentId: parentId == null && nullToAbsent
          ? const Value.absent()
          : Value(parentId),
      categoryKind: Value(categoryKind),
      color: color == null && nullToAbsent
          ? const Value.absent()
          : Value(color),
      icon: icon == null && nullToAbsent ? const Value.absent() : Value(icon),
      displayOrder: Value(displayOrder),
      archivedAt: archivedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(archivedAt),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
    );
  }

  factory CategoryRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return CategoryRow(
      id: serializer.fromJson<String>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      parentId: serializer.fromJson<String?>(json['parentId']),
      categoryKind: serializer.fromJson<String>(json['categoryKind']),
      color: serializer.fromJson<String?>(json['color']),
      icon: serializer.fromJson<String?>(json['icon']),
      displayOrder: serializer.fromJson<int>(json['displayOrder']),
      archivedAt: serializer.fromJson<String?>(json['archivedAt']),
      createdAt: serializer.fromJson<String>(json['createdAt']),
      updatedAt: serializer.fromJson<String>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'name': serializer.toJson<String>(name),
      'parentId': serializer.toJson<String?>(parentId),
      'categoryKind': serializer.toJson<String>(categoryKind),
      'color': serializer.toJson<String?>(color),
      'icon': serializer.toJson<String?>(icon),
      'displayOrder': serializer.toJson<int>(displayOrder),
      'archivedAt': serializer.toJson<String?>(archivedAt),
      'createdAt': serializer.toJson<String>(createdAt),
      'updatedAt': serializer.toJson<String>(updatedAt),
    };
  }

  CategoryRow copyWith({
    String? id,
    String? name,
    Value<String?> parentId = const Value.absent(),
    String? categoryKind,
    Value<String?> color = const Value.absent(),
    Value<String?> icon = const Value.absent(),
    int? displayOrder,
    Value<String?> archivedAt = const Value.absent(),
    String? createdAt,
    String? updatedAt,
  }) => CategoryRow(
    id: id ?? this.id,
    name: name ?? this.name,
    parentId: parentId.present ? parentId.value : this.parentId,
    categoryKind: categoryKind ?? this.categoryKind,
    color: color.present ? color.value : this.color,
    icon: icon.present ? icon.value : this.icon,
    displayOrder: displayOrder ?? this.displayOrder,
    archivedAt: archivedAt.present ? archivedAt.value : this.archivedAt,
    createdAt: createdAt ?? this.createdAt,
    updatedAt: updatedAt ?? this.updatedAt,
  );
  CategoryRow copyWithCompanion(CategoriesCompanion data) {
    return CategoryRow(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      parentId: data.parentId.present ? data.parentId.value : this.parentId,
      categoryKind: data.categoryKind.present
          ? data.categoryKind.value
          : this.categoryKind,
      color: data.color.present ? data.color.value : this.color,
      icon: data.icon.present ? data.icon.value : this.icon,
      displayOrder: data.displayOrder.present
          ? data.displayOrder.value
          : this.displayOrder,
      archivedAt: data.archivedAt.present
          ? data.archivedAt.value
          : this.archivedAt,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('CategoryRow(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('parentId: $parentId, ')
          ..write('categoryKind: $categoryKind, ')
          ..write('color: $color, ')
          ..write('icon: $icon, ')
          ..write('displayOrder: $displayOrder, ')
          ..write('archivedAt: $archivedAt, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    name,
    parentId,
    categoryKind,
    color,
    icon,
    displayOrder,
    archivedAt,
    createdAt,
    updatedAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is CategoryRow &&
          other.id == this.id &&
          other.name == this.name &&
          other.parentId == this.parentId &&
          other.categoryKind == this.categoryKind &&
          other.color == this.color &&
          other.icon == this.icon &&
          other.displayOrder == this.displayOrder &&
          other.archivedAt == this.archivedAt &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class CategoriesCompanion extends UpdateCompanion<CategoryRow> {
  final Value<String> id;
  final Value<String> name;
  final Value<String?> parentId;
  final Value<String> categoryKind;
  final Value<String?> color;
  final Value<String?> icon;
  final Value<int> displayOrder;
  final Value<String?> archivedAt;
  final Value<String> createdAt;
  final Value<String> updatedAt;
  final Value<int> rowid;
  const CategoriesCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.parentId = const Value.absent(),
    this.categoryKind = const Value.absent(),
    this.color = const Value.absent(),
    this.icon = const Value.absent(),
    this.displayOrder = const Value.absent(),
    this.archivedAt = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  CategoriesCompanion.insert({
    required String id,
    required String name,
    this.parentId = const Value.absent(),
    required String categoryKind,
    this.color = const Value.absent(),
    this.icon = const Value.absent(),
    required int displayOrder,
    this.archivedAt = const Value.absent(),
    required String createdAt,
    required String updatedAt,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       name = Value(name),
       categoryKind = Value(categoryKind),
       displayOrder = Value(displayOrder),
       createdAt = Value(createdAt),
       updatedAt = Value(updatedAt);
  static Insertable<CategoryRow> custom({
    Expression<String>? id,
    Expression<String>? name,
    Expression<String>? parentId,
    Expression<String>? categoryKind,
    Expression<String>? color,
    Expression<String>? icon,
    Expression<int>? displayOrder,
    Expression<String>? archivedAt,
    Expression<String>? createdAt,
    Expression<String>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (parentId != null) 'parent_id': parentId,
      if (categoryKind != null) 'category_kind': categoryKind,
      if (color != null) 'color': color,
      if (icon != null) 'icon': icon,
      if (displayOrder != null) 'display_order': displayOrder,
      if (archivedAt != null) 'archived_at': archivedAt,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  CategoriesCompanion copyWith({
    Value<String>? id,
    Value<String>? name,
    Value<String?>? parentId,
    Value<String>? categoryKind,
    Value<String?>? color,
    Value<String?>? icon,
    Value<int>? displayOrder,
    Value<String?>? archivedAt,
    Value<String>? createdAt,
    Value<String>? updatedAt,
    Value<int>? rowid,
  }) {
    return CategoriesCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      parentId: parentId ?? this.parentId,
      categoryKind: categoryKind ?? this.categoryKind,
      color: color ?? this.color,
      icon: icon ?? this.icon,
      displayOrder: displayOrder ?? this.displayOrder,
      archivedAt: archivedAt ?? this.archivedAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (parentId.present) {
      map['parent_id'] = Variable<String>(parentId.value);
    }
    if (categoryKind.present) {
      map['category_kind'] = Variable<String>(categoryKind.value);
    }
    if (color.present) {
      map['color'] = Variable<String>(color.value);
    }
    if (icon.present) {
      map['icon'] = Variable<String>(icon.value);
    }
    if (displayOrder.present) {
      map['display_order'] = Variable<int>(displayOrder.value);
    }
    if (archivedAt.present) {
      map['archived_at'] = Variable<String>(archivedAt.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<String>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<String>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('CategoriesCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('parentId: $parentId, ')
          ..write('categoryKind: $categoryKind, ')
          ..write('color: $color, ')
          ..write('icon: $icon, ')
          ..write('displayOrder: $displayOrder, ')
          ..write('archivedAt: $archivedAt, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $TagsTable extends Tags with TableInfo<$TagsTable, TagRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $TagsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _colorMeta = const VerificationMeta('color');
  @override
  late final GeneratedColumn<String> color = GeneratedColumn<String>(
    'color',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _archivedAtMeta = const VerificationMeta(
    'archivedAt',
  );
  @override
  late final GeneratedColumn<String> archivedAt = GeneratedColumn<String>(
    'archived_at',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<String> createdAt = GeneratedColumn<String>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<String> updatedAt = GeneratedColumn<String>(
    'updated_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    name,
    color,
    archivedAt,
    createdAt,
    updatedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'tags';
  @override
  VerificationContext validateIntegrity(
    Insertable<TagRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('color')) {
      context.handle(
        _colorMeta,
        color.isAcceptableOrUnknown(data['color']!, _colorMeta),
      );
    }
    if (data.containsKey('archived_at')) {
      context.handle(
        _archivedAtMeta,
        archivedAt.isAcceptableOrUnknown(data['archived_at']!, _archivedAtMeta),
      );
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  TagRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return TagRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      color: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}color'],
      ),
      archivedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}archived_at'],
      ),
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}created_at'],
      )!,
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}updated_at'],
      )!,
    );
  }

  @override
  $TagsTable createAlias(String alias) {
    return $TagsTable(attachedDatabase, alias);
  }
}

class TagRow extends DataClass implements Insertable<TagRow> {
  final String id;
  final String name;
  final String? color;
  final String? archivedAt;
  final String createdAt;
  final String updatedAt;
  const TagRow({
    required this.id,
    required this.name,
    this.color,
    this.archivedAt,
    required this.createdAt,
    required this.updatedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['name'] = Variable<String>(name);
    if (!nullToAbsent || color != null) {
      map['color'] = Variable<String>(color);
    }
    if (!nullToAbsent || archivedAt != null) {
      map['archived_at'] = Variable<String>(archivedAt);
    }
    map['created_at'] = Variable<String>(createdAt);
    map['updated_at'] = Variable<String>(updatedAt);
    return map;
  }

  TagsCompanion toCompanion(bool nullToAbsent) {
    return TagsCompanion(
      id: Value(id),
      name: Value(name),
      color: color == null && nullToAbsent
          ? const Value.absent()
          : Value(color),
      archivedAt: archivedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(archivedAt),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
    );
  }

  factory TagRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return TagRow(
      id: serializer.fromJson<String>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      color: serializer.fromJson<String?>(json['color']),
      archivedAt: serializer.fromJson<String?>(json['archivedAt']),
      createdAt: serializer.fromJson<String>(json['createdAt']),
      updatedAt: serializer.fromJson<String>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'name': serializer.toJson<String>(name),
      'color': serializer.toJson<String?>(color),
      'archivedAt': serializer.toJson<String?>(archivedAt),
      'createdAt': serializer.toJson<String>(createdAt),
      'updatedAt': serializer.toJson<String>(updatedAt),
    };
  }

  TagRow copyWith({
    String? id,
    String? name,
    Value<String?> color = const Value.absent(),
    Value<String?> archivedAt = const Value.absent(),
    String? createdAt,
    String? updatedAt,
  }) => TagRow(
    id: id ?? this.id,
    name: name ?? this.name,
    color: color.present ? color.value : this.color,
    archivedAt: archivedAt.present ? archivedAt.value : this.archivedAt,
    createdAt: createdAt ?? this.createdAt,
    updatedAt: updatedAt ?? this.updatedAt,
  );
  TagRow copyWithCompanion(TagsCompanion data) {
    return TagRow(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      color: data.color.present ? data.color.value : this.color,
      archivedAt: data.archivedAt.present
          ? data.archivedAt.value
          : this.archivedAt,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('TagRow(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('color: $color, ')
          ..write('archivedAt: $archivedAt, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, name, color, archivedAt, createdAt, updatedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is TagRow &&
          other.id == this.id &&
          other.name == this.name &&
          other.color == this.color &&
          other.archivedAt == this.archivedAt &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class TagsCompanion extends UpdateCompanion<TagRow> {
  final Value<String> id;
  final Value<String> name;
  final Value<String?> color;
  final Value<String?> archivedAt;
  final Value<String> createdAt;
  final Value<String> updatedAt;
  final Value<int> rowid;
  const TagsCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.color = const Value.absent(),
    this.archivedAt = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  TagsCompanion.insert({
    required String id,
    required String name,
    this.color = const Value.absent(),
    this.archivedAt = const Value.absent(),
    required String createdAt,
    required String updatedAt,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       name = Value(name),
       createdAt = Value(createdAt),
       updatedAt = Value(updatedAt);
  static Insertable<TagRow> custom({
    Expression<String>? id,
    Expression<String>? name,
    Expression<String>? color,
    Expression<String>? archivedAt,
    Expression<String>? createdAt,
    Expression<String>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (color != null) 'color': color,
      if (archivedAt != null) 'archived_at': archivedAt,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  TagsCompanion copyWith({
    Value<String>? id,
    Value<String>? name,
    Value<String?>? color,
    Value<String?>? archivedAt,
    Value<String>? createdAt,
    Value<String>? updatedAt,
    Value<int>? rowid,
  }) {
    return TagsCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      color: color ?? this.color,
      archivedAt: archivedAt ?? this.archivedAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (color.present) {
      map['color'] = Variable<String>(color.value);
    }
    if (archivedAt.present) {
      map['archived_at'] = Variable<String>(archivedAt.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<String>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<String>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('TagsCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('color: $color, ')
          ..write('archivedAt: $archivedAt, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $CashflowEventsTable extends CashflowEvents
    with TableInfo<$CashflowEventsTable, CashflowEventRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $CashflowEventsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _eventDateMeta = const VerificationMeta(
    'eventDate',
  );
  @override
  late final GeneratedColumn<String> eventDate = GeneratedColumn<String>(
    'event_date',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _occurredAtMeta = const VerificationMeta(
    'occurredAt',
  );
  @override
  late final GeneratedColumn<String> occurredAt = GeneratedColumn<String>(
    'occurred_at',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _titleMeta = const VerificationMeta('title');
  @override
  late final GeneratedColumn<String> title = GeneratedColumn<String>(
    'title',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _counterpartyMeta = const VerificationMeta(
    'counterparty',
  );
  @override
  late final GeneratedColumn<String> counterparty = GeneratedColumn<String>(
    'counterparty',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _descriptionMeta = const VerificationMeta(
    'description',
  );
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
    'description',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _amountMeta = const VerificationMeta('amount');
  @override
  late final GeneratedColumn<String> amount = GeneratedColumn<String>(
    'amount',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _currencyMeta = const VerificationMeta(
    'currency',
  );
  @override
  late final GeneratedColumn<String> currency = GeneratedColumn<String>(
    'currency',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _directionMeta = const VerificationMeta(
    'direction',
  );
  @override
  late final GeneratedColumn<String> direction = GeneratedColumn<String>(
    'direction',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _flowKindMeta = const VerificationMeta(
    'flowKind',
  );
  @override
  late final GeneratedColumn<String> flowKind = GeneratedColumn<String>(
    'flow_kind',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _categoryIdMeta = const VerificationMeta(
    'categoryId',
  );
  @override
  late final GeneratedColumn<String> categoryId = GeneratedColumn<String>(
    'category_id',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _sourceKindMeta = const VerificationMeta(
    'sourceKind',
  );
  @override
  late final GeneratedColumn<String> sourceKind = GeneratedColumn<String>(
    'source_kind',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _sourceNameMeta = const VerificationMeta(
    'sourceName',
  );
  @override
  late final GeneratedColumn<String> sourceName = GeneratedColumn<String>(
    'source_name',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _paymentMethodMeta = const VerificationMeta(
    'paymentMethod',
  );
  @override
  late final GeneratedColumn<String> paymentMethod = GeneratedColumn<String>(
    'payment_method',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _accountHintMeta = const VerificationMeta(
    'accountHint',
  );
  @override
  late final GeneratedColumn<String> accountHint = GeneratedColumn<String>(
    'account_hint',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _includeInAnalyticsMeta =
      const VerificationMeta('includeInAnalytics');
  @override
  late final GeneratedColumn<bool> includeInAnalytics = GeneratedColumn<bool>(
    'include_in_analytics',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: true,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("include_in_analytics" IN (0, 1))',
    ),
  );
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
    'status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<String> createdAt = GeneratedColumn<String>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<String> updatedAt = GeneratedColumn<String>(
    'updated_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    eventDate,
    occurredAt,
    title,
    counterparty,
    description,
    amount,
    currency,
    direction,
    flowKind,
    categoryId,
    sourceKind,
    sourceName,
    paymentMethod,
    accountHint,
    includeInAnalytics,
    status,
    createdAt,
    updatedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'cashflow_events';
  @override
  VerificationContext validateIntegrity(
    Insertable<CashflowEventRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('event_date')) {
      context.handle(
        _eventDateMeta,
        eventDate.isAcceptableOrUnknown(data['event_date']!, _eventDateMeta),
      );
    } else if (isInserting) {
      context.missing(_eventDateMeta);
    }
    if (data.containsKey('occurred_at')) {
      context.handle(
        _occurredAtMeta,
        occurredAt.isAcceptableOrUnknown(data['occurred_at']!, _occurredAtMeta),
      );
    }
    if (data.containsKey('title')) {
      context.handle(
        _titleMeta,
        title.isAcceptableOrUnknown(data['title']!, _titleMeta),
      );
    }
    if (data.containsKey('counterparty')) {
      context.handle(
        _counterpartyMeta,
        counterparty.isAcceptableOrUnknown(
          data['counterparty']!,
          _counterpartyMeta,
        ),
      );
    }
    if (data.containsKey('description')) {
      context.handle(
        _descriptionMeta,
        description.isAcceptableOrUnknown(
          data['description']!,
          _descriptionMeta,
        ),
      );
    }
    if (data.containsKey('amount')) {
      context.handle(
        _amountMeta,
        amount.isAcceptableOrUnknown(data['amount']!, _amountMeta),
      );
    } else if (isInserting) {
      context.missing(_amountMeta);
    }
    if (data.containsKey('currency')) {
      context.handle(
        _currencyMeta,
        currency.isAcceptableOrUnknown(data['currency']!, _currencyMeta),
      );
    } else if (isInserting) {
      context.missing(_currencyMeta);
    }
    if (data.containsKey('direction')) {
      context.handle(
        _directionMeta,
        direction.isAcceptableOrUnknown(data['direction']!, _directionMeta),
      );
    } else if (isInserting) {
      context.missing(_directionMeta);
    }
    if (data.containsKey('flow_kind')) {
      context.handle(
        _flowKindMeta,
        flowKind.isAcceptableOrUnknown(data['flow_kind']!, _flowKindMeta),
      );
    } else if (isInserting) {
      context.missing(_flowKindMeta);
    }
    if (data.containsKey('category_id')) {
      context.handle(
        _categoryIdMeta,
        categoryId.isAcceptableOrUnknown(data['category_id']!, _categoryIdMeta),
      );
    }
    if (data.containsKey('source_kind')) {
      context.handle(
        _sourceKindMeta,
        sourceKind.isAcceptableOrUnknown(data['source_kind']!, _sourceKindMeta),
      );
    } else if (isInserting) {
      context.missing(_sourceKindMeta);
    }
    if (data.containsKey('source_name')) {
      context.handle(
        _sourceNameMeta,
        sourceName.isAcceptableOrUnknown(data['source_name']!, _sourceNameMeta),
      );
    }
    if (data.containsKey('payment_method')) {
      context.handle(
        _paymentMethodMeta,
        paymentMethod.isAcceptableOrUnknown(
          data['payment_method']!,
          _paymentMethodMeta,
        ),
      );
    }
    if (data.containsKey('account_hint')) {
      context.handle(
        _accountHintMeta,
        accountHint.isAcceptableOrUnknown(
          data['account_hint']!,
          _accountHintMeta,
        ),
      );
    }
    if (data.containsKey('include_in_analytics')) {
      context.handle(
        _includeInAnalyticsMeta,
        includeInAnalytics.isAcceptableOrUnknown(
          data['include_in_analytics']!,
          _includeInAnalyticsMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_includeInAnalyticsMeta);
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  CashflowEventRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return CashflowEventRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      eventDate: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}event_date'],
      )!,
      occurredAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}occurred_at'],
      ),
      title: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}title'],
      ),
      counterparty: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}counterparty'],
      ),
      description: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}description'],
      ),
      amount: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}amount'],
      )!,
      currency: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}currency'],
      )!,
      direction: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}direction'],
      )!,
      flowKind: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}flow_kind'],
      )!,
      categoryId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}category_id'],
      ),
      sourceKind: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}source_kind'],
      )!,
      sourceName: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}source_name'],
      ),
      paymentMethod: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}payment_method'],
      ),
      accountHint: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}account_hint'],
      ),
      includeInAnalytics: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}include_in_analytics'],
      )!,
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}created_at'],
      )!,
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}updated_at'],
      )!,
    );
  }

  @override
  $CashflowEventsTable createAlias(String alias) {
    return $CashflowEventsTable(attachedDatabase, alias);
  }
}

class CashflowEventRow extends DataClass
    implements Insertable<CashflowEventRow> {
  final String id;
  final String eventDate;
  final String? occurredAt;
  final String? title;
  final String? counterparty;
  final String? description;
  final String amount;
  final String currency;
  final String direction;
  final String flowKind;
  final String? categoryId;
  final String sourceKind;
  final String? sourceName;
  final String? paymentMethod;
  final String? accountHint;
  final bool includeInAnalytics;
  final String status;
  final String createdAt;
  final String updatedAt;
  const CashflowEventRow({
    required this.id,
    required this.eventDate,
    this.occurredAt,
    this.title,
    this.counterparty,
    this.description,
    required this.amount,
    required this.currency,
    required this.direction,
    required this.flowKind,
    this.categoryId,
    required this.sourceKind,
    this.sourceName,
    this.paymentMethod,
    this.accountHint,
    required this.includeInAnalytics,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['event_date'] = Variable<String>(eventDate);
    if (!nullToAbsent || occurredAt != null) {
      map['occurred_at'] = Variable<String>(occurredAt);
    }
    if (!nullToAbsent || title != null) {
      map['title'] = Variable<String>(title);
    }
    if (!nullToAbsent || counterparty != null) {
      map['counterparty'] = Variable<String>(counterparty);
    }
    if (!nullToAbsent || description != null) {
      map['description'] = Variable<String>(description);
    }
    map['amount'] = Variable<String>(amount);
    map['currency'] = Variable<String>(currency);
    map['direction'] = Variable<String>(direction);
    map['flow_kind'] = Variable<String>(flowKind);
    if (!nullToAbsent || categoryId != null) {
      map['category_id'] = Variable<String>(categoryId);
    }
    map['source_kind'] = Variable<String>(sourceKind);
    if (!nullToAbsent || sourceName != null) {
      map['source_name'] = Variable<String>(sourceName);
    }
    if (!nullToAbsent || paymentMethod != null) {
      map['payment_method'] = Variable<String>(paymentMethod);
    }
    if (!nullToAbsent || accountHint != null) {
      map['account_hint'] = Variable<String>(accountHint);
    }
    map['include_in_analytics'] = Variable<bool>(includeInAnalytics);
    map['status'] = Variable<String>(status);
    map['created_at'] = Variable<String>(createdAt);
    map['updated_at'] = Variable<String>(updatedAt);
    return map;
  }

  CashflowEventsCompanion toCompanion(bool nullToAbsent) {
    return CashflowEventsCompanion(
      id: Value(id),
      eventDate: Value(eventDate),
      occurredAt: occurredAt == null && nullToAbsent
          ? const Value.absent()
          : Value(occurredAt),
      title: title == null && nullToAbsent
          ? const Value.absent()
          : Value(title),
      counterparty: counterparty == null && nullToAbsent
          ? const Value.absent()
          : Value(counterparty),
      description: description == null && nullToAbsent
          ? const Value.absent()
          : Value(description),
      amount: Value(amount),
      currency: Value(currency),
      direction: Value(direction),
      flowKind: Value(flowKind),
      categoryId: categoryId == null && nullToAbsent
          ? const Value.absent()
          : Value(categoryId),
      sourceKind: Value(sourceKind),
      sourceName: sourceName == null && nullToAbsent
          ? const Value.absent()
          : Value(sourceName),
      paymentMethod: paymentMethod == null && nullToAbsent
          ? const Value.absent()
          : Value(paymentMethod),
      accountHint: accountHint == null && nullToAbsent
          ? const Value.absent()
          : Value(accountHint),
      includeInAnalytics: Value(includeInAnalytics),
      status: Value(status),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
    );
  }

  factory CashflowEventRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return CashflowEventRow(
      id: serializer.fromJson<String>(json['id']),
      eventDate: serializer.fromJson<String>(json['eventDate']),
      occurredAt: serializer.fromJson<String?>(json['occurredAt']),
      title: serializer.fromJson<String?>(json['title']),
      counterparty: serializer.fromJson<String?>(json['counterparty']),
      description: serializer.fromJson<String?>(json['description']),
      amount: serializer.fromJson<String>(json['amount']),
      currency: serializer.fromJson<String>(json['currency']),
      direction: serializer.fromJson<String>(json['direction']),
      flowKind: serializer.fromJson<String>(json['flowKind']),
      categoryId: serializer.fromJson<String?>(json['categoryId']),
      sourceKind: serializer.fromJson<String>(json['sourceKind']),
      sourceName: serializer.fromJson<String?>(json['sourceName']),
      paymentMethod: serializer.fromJson<String?>(json['paymentMethod']),
      accountHint: serializer.fromJson<String?>(json['accountHint']),
      includeInAnalytics: serializer.fromJson<bool>(json['includeInAnalytics']),
      status: serializer.fromJson<String>(json['status']),
      createdAt: serializer.fromJson<String>(json['createdAt']),
      updatedAt: serializer.fromJson<String>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'eventDate': serializer.toJson<String>(eventDate),
      'occurredAt': serializer.toJson<String?>(occurredAt),
      'title': serializer.toJson<String?>(title),
      'counterparty': serializer.toJson<String?>(counterparty),
      'description': serializer.toJson<String?>(description),
      'amount': serializer.toJson<String>(amount),
      'currency': serializer.toJson<String>(currency),
      'direction': serializer.toJson<String>(direction),
      'flowKind': serializer.toJson<String>(flowKind),
      'categoryId': serializer.toJson<String?>(categoryId),
      'sourceKind': serializer.toJson<String>(sourceKind),
      'sourceName': serializer.toJson<String?>(sourceName),
      'paymentMethod': serializer.toJson<String?>(paymentMethod),
      'accountHint': serializer.toJson<String?>(accountHint),
      'includeInAnalytics': serializer.toJson<bool>(includeInAnalytics),
      'status': serializer.toJson<String>(status),
      'createdAt': serializer.toJson<String>(createdAt),
      'updatedAt': serializer.toJson<String>(updatedAt),
    };
  }

  CashflowEventRow copyWith({
    String? id,
    String? eventDate,
    Value<String?> occurredAt = const Value.absent(),
    Value<String?> title = const Value.absent(),
    Value<String?> counterparty = const Value.absent(),
    Value<String?> description = const Value.absent(),
    String? amount,
    String? currency,
    String? direction,
    String? flowKind,
    Value<String?> categoryId = const Value.absent(),
    String? sourceKind,
    Value<String?> sourceName = const Value.absent(),
    Value<String?> paymentMethod = const Value.absent(),
    Value<String?> accountHint = const Value.absent(),
    bool? includeInAnalytics,
    String? status,
    String? createdAt,
    String? updatedAt,
  }) => CashflowEventRow(
    id: id ?? this.id,
    eventDate: eventDate ?? this.eventDate,
    occurredAt: occurredAt.present ? occurredAt.value : this.occurredAt,
    title: title.present ? title.value : this.title,
    counterparty: counterparty.present ? counterparty.value : this.counterparty,
    description: description.present ? description.value : this.description,
    amount: amount ?? this.amount,
    currency: currency ?? this.currency,
    direction: direction ?? this.direction,
    flowKind: flowKind ?? this.flowKind,
    categoryId: categoryId.present ? categoryId.value : this.categoryId,
    sourceKind: sourceKind ?? this.sourceKind,
    sourceName: sourceName.present ? sourceName.value : this.sourceName,
    paymentMethod: paymentMethod.present
        ? paymentMethod.value
        : this.paymentMethod,
    accountHint: accountHint.present ? accountHint.value : this.accountHint,
    includeInAnalytics: includeInAnalytics ?? this.includeInAnalytics,
    status: status ?? this.status,
    createdAt: createdAt ?? this.createdAt,
    updatedAt: updatedAt ?? this.updatedAt,
  );
  CashflowEventRow copyWithCompanion(CashflowEventsCompanion data) {
    return CashflowEventRow(
      id: data.id.present ? data.id.value : this.id,
      eventDate: data.eventDate.present ? data.eventDate.value : this.eventDate,
      occurredAt: data.occurredAt.present
          ? data.occurredAt.value
          : this.occurredAt,
      title: data.title.present ? data.title.value : this.title,
      counterparty: data.counterparty.present
          ? data.counterparty.value
          : this.counterparty,
      description: data.description.present
          ? data.description.value
          : this.description,
      amount: data.amount.present ? data.amount.value : this.amount,
      currency: data.currency.present ? data.currency.value : this.currency,
      direction: data.direction.present ? data.direction.value : this.direction,
      flowKind: data.flowKind.present ? data.flowKind.value : this.flowKind,
      categoryId: data.categoryId.present
          ? data.categoryId.value
          : this.categoryId,
      sourceKind: data.sourceKind.present
          ? data.sourceKind.value
          : this.sourceKind,
      sourceName: data.sourceName.present
          ? data.sourceName.value
          : this.sourceName,
      paymentMethod: data.paymentMethod.present
          ? data.paymentMethod.value
          : this.paymentMethod,
      accountHint: data.accountHint.present
          ? data.accountHint.value
          : this.accountHint,
      includeInAnalytics: data.includeInAnalytics.present
          ? data.includeInAnalytics.value
          : this.includeInAnalytics,
      status: data.status.present ? data.status.value : this.status,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('CashflowEventRow(')
          ..write('id: $id, ')
          ..write('eventDate: $eventDate, ')
          ..write('occurredAt: $occurredAt, ')
          ..write('title: $title, ')
          ..write('counterparty: $counterparty, ')
          ..write('description: $description, ')
          ..write('amount: $amount, ')
          ..write('currency: $currency, ')
          ..write('direction: $direction, ')
          ..write('flowKind: $flowKind, ')
          ..write('categoryId: $categoryId, ')
          ..write('sourceKind: $sourceKind, ')
          ..write('sourceName: $sourceName, ')
          ..write('paymentMethod: $paymentMethod, ')
          ..write('accountHint: $accountHint, ')
          ..write('includeInAnalytics: $includeInAnalytics, ')
          ..write('status: $status, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    eventDate,
    occurredAt,
    title,
    counterparty,
    description,
    amount,
    currency,
    direction,
    flowKind,
    categoryId,
    sourceKind,
    sourceName,
    paymentMethod,
    accountHint,
    includeInAnalytics,
    status,
    createdAt,
    updatedAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is CashflowEventRow &&
          other.id == this.id &&
          other.eventDate == this.eventDate &&
          other.occurredAt == this.occurredAt &&
          other.title == this.title &&
          other.counterparty == this.counterparty &&
          other.description == this.description &&
          other.amount == this.amount &&
          other.currency == this.currency &&
          other.direction == this.direction &&
          other.flowKind == this.flowKind &&
          other.categoryId == this.categoryId &&
          other.sourceKind == this.sourceKind &&
          other.sourceName == this.sourceName &&
          other.paymentMethod == this.paymentMethod &&
          other.accountHint == this.accountHint &&
          other.includeInAnalytics == this.includeInAnalytics &&
          other.status == this.status &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class CashflowEventsCompanion extends UpdateCompanion<CashflowEventRow> {
  final Value<String> id;
  final Value<String> eventDate;
  final Value<String?> occurredAt;
  final Value<String?> title;
  final Value<String?> counterparty;
  final Value<String?> description;
  final Value<String> amount;
  final Value<String> currency;
  final Value<String> direction;
  final Value<String> flowKind;
  final Value<String?> categoryId;
  final Value<String> sourceKind;
  final Value<String?> sourceName;
  final Value<String?> paymentMethod;
  final Value<String?> accountHint;
  final Value<bool> includeInAnalytics;
  final Value<String> status;
  final Value<String> createdAt;
  final Value<String> updatedAt;
  final Value<int> rowid;
  const CashflowEventsCompanion({
    this.id = const Value.absent(),
    this.eventDate = const Value.absent(),
    this.occurredAt = const Value.absent(),
    this.title = const Value.absent(),
    this.counterparty = const Value.absent(),
    this.description = const Value.absent(),
    this.amount = const Value.absent(),
    this.currency = const Value.absent(),
    this.direction = const Value.absent(),
    this.flowKind = const Value.absent(),
    this.categoryId = const Value.absent(),
    this.sourceKind = const Value.absent(),
    this.sourceName = const Value.absent(),
    this.paymentMethod = const Value.absent(),
    this.accountHint = const Value.absent(),
    this.includeInAnalytics = const Value.absent(),
    this.status = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  CashflowEventsCompanion.insert({
    required String id,
    required String eventDate,
    this.occurredAt = const Value.absent(),
    this.title = const Value.absent(),
    this.counterparty = const Value.absent(),
    this.description = const Value.absent(),
    required String amount,
    required String currency,
    required String direction,
    required String flowKind,
    this.categoryId = const Value.absent(),
    required String sourceKind,
    this.sourceName = const Value.absent(),
    this.paymentMethod = const Value.absent(),
    this.accountHint = const Value.absent(),
    required bool includeInAnalytics,
    required String status,
    required String createdAt,
    required String updatedAt,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       eventDate = Value(eventDate),
       amount = Value(amount),
       currency = Value(currency),
       direction = Value(direction),
       flowKind = Value(flowKind),
       sourceKind = Value(sourceKind),
       includeInAnalytics = Value(includeInAnalytics),
       status = Value(status),
       createdAt = Value(createdAt),
       updatedAt = Value(updatedAt);
  static Insertable<CashflowEventRow> custom({
    Expression<String>? id,
    Expression<String>? eventDate,
    Expression<String>? occurredAt,
    Expression<String>? title,
    Expression<String>? counterparty,
    Expression<String>? description,
    Expression<String>? amount,
    Expression<String>? currency,
    Expression<String>? direction,
    Expression<String>? flowKind,
    Expression<String>? categoryId,
    Expression<String>? sourceKind,
    Expression<String>? sourceName,
    Expression<String>? paymentMethod,
    Expression<String>? accountHint,
    Expression<bool>? includeInAnalytics,
    Expression<String>? status,
    Expression<String>? createdAt,
    Expression<String>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (eventDate != null) 'event_date': eventDate,
      if (occurredAt != null) 'occurred_at': occurredAt,
      if (title != null) 'title': title,
      if (counterparty != null) 'counterparty': counterparty,
      if (description != null) 'description': description,
      if (amount != null) 'amount': amount,
      if (currency != null) 'currency': currency,
      if (direction != null) 'direction': direction,
      if (flowKind != null) 'flow_kind': flowKind,
      if (categoryId != null) 'category_id': categoryId,
      if (sourceKind != null) 'source_kind': sourceKind,
      if (sourceName != null) 'source_name': sourceName,
      if (paymentMethod != null) 'payment_method': paymentMethod,
      if (accountHint != null) 'account_hint': accountHint,
      if (includeInAnalytics != null)
        'include_in_analytics': includeInAnalytics,
      if (status != null) 'status': status,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  CashflowEventsCompanion copyWith({
    Value<String>? id,
    Value<String>? eventDate,
    Value<String?>? occurredAt,
    Value<String?>? title,
    Value<String?>? counterparty,
    Value<String?>? description,
    Value<String>? amount,
    Value<String>? currency,
    Value<String>? direction,
    Value<String>? flowKind,
    Value<String?>? categoryId,
    Value<String>? sourceKind,
    Value<String?>? sourceName,
    Value<String?>? paymentMethod,
    Value<String?>? accountHint,
    Value<bool>? includeInAnalytics,
    Value<String>? status,
    Value<String>? createdAt,
    Value<String>? updatedAt,
    Value<int>? rowid,
  }) {
    return CashflowEventsCompanion(
      id: id ?? this.id,
      eventDate: eventDate ?? this.eventDate,
      occurredAt: occurredAt ?? this.occurredAt,
      title: title ?? this.title,
      counterparty: counterparty ?? this.counterparty,
      description: description ?? this.description,
      amount: amount ?? this.amount,
      currency: currency ?? this.currency,
      direction: direction ?? this.direction,
      flowKind: flowKind ?? this.flowKind,
      categoryId: categoryId ?? this.categoryId,
      sourceKind: sourceKind ?? this.sourceKind,
      sourceName: sourceName ?? this.sourceName,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      accountHint: accountHint ?? this.accountHint,
      includeInAnalytics: includeInAnalytics ?? this.includeInAnalytics,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (eventDate.present) {
      map['event_date'] = Variable<String>(eventDate.value);
    }
    if (occurredAt.present) {
      map['occurred_at'] = Variable<String>(occurredAt.value);
    }
    if (title.present) {
      map['title'] = Variable<String>(title.value);
    }
    if (counterparty.present) {
      map['counterparty'] = Variable<String>(counterparty.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (amount.present) {
      map['amount'] = Variable<String>(amount.value);
    }
    if (currency.present) {
      map['currency'] = Variable<String>(currency.value);
    }
    if (direction.present) {
      map['direction'] = Variable<String>(direction.value);
    }
    if (flowKind.present) {
      map['flow_kind'] = Variable<String>(flowKind.value);
    }
    if (categoryId.present) {
      map['category_id'] = Variable<String>(categoryId.value);
    }
    if (sourceKind.present) {
      map['source_kind'] = Variable<String>(sourceKind.value);
    }
    if (sourceName.present) {
      map['source_name'] = Variable<String>(sourceName.value);
    }
    if (paymentMethod.present) {
      map['payment_method'] = Variable<String>(paymentMethod.value);
    }
    if (accountHint.present) {
      map['account_hint'] = Variable<String>(accountHint.value);
    }
    if (includeInAnalytics.present) {
      map['include_in_analytics'] = Variable<bool>(includeInAnalytics.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<String>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<String>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('CashflowEventsCompanion(')
          ..write('id: $id, ')
          ..write('eventDate: $eventDate, ')
          ..write('occurredAt: $occurredAt, ')
          ..write('title: $title, ')
          ..write('counterparty: $counterparty, ')
          ..write('description: $description, ')
          ..write('amount: $amount, ')
          ..write('currency: $currency, ')
          ..write('direction: $direction, ')
          ..write('flowKind: $flowKind, ')
          ..write('categoryId: $categoryId, ')
          ..write('sourceKind: $sourceKind, ')
          ..write('sourceName: $sourceName, ')
          ..write('paymentMethod: $paymentMethod, ')
          ..write('accountHint: $accountHint, ')
          ..write('includeInAnalytics: $includeInAnalytics, ')
          ..write('status: $status, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $CashflowEventTagsTable extends CashflowEventTags
    with TableInfo<$CashflowEventTagsTable, CashflowEventTagRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $CashflowEventTagsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _cashflowEventIdMeta = const VerificationMeta(
    'cashflowEventId',
  );
  @override
  late final GeneratedColumn<String> cashflowEventId = GeneratedColumn<String>(
    'cashflow_event_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _tagIdMeta = const VerificationMeta('tagId');
  @override
  late final GeneratedColumn<String> tagId = GeneratedColumn<String>(
    'tag_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [cashflowEventId, tagId];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'cashflow_event_tags';
  @override
  VerificationContext validateIntegrity(
    Insertable<CashflowEventTagRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('cashflow_event_id')) {
      context.handle(
        _cashflowEventIdMeta,
        cashflowEventId.isAcceptableOrUnknown(
          data['cashflow_event_id']!,
          _cashflowEventIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_cashflowEventIdMeta);
    }
    if (data.containsKey('tag_id')) {
      context.handle(
        _tagIdMeta,
        tagId.isAcceptableOrUnknown(data['tag_id']!, _tagIdMeta),
      );
    } else if (isInserting) {
      context.missing(_tagIdMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {cashflowEventId, tagId};
  @override
  CashflowEventTagRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return CashflowEventTagRow(
      cashflowEventId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}cashflow_event_id'],
      )!,
      tagId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}tag_id'],
      )!,
    );
  }

  @override
  $CashflowEventTagsTable createAlias(String alias) {
    return $CashflowEventTagsTable(attachedDatabase, alias);
  }
}

class CashflowEventTagRow extends DataClass
    implements Insertable<CashflowEventTagRow> {
  final String cashflowEventId;
  final String tagId;
  const CashflowEventTagRow({
    required this.cashflowEventId,
    required this.tagId,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['cashflow_event_id'] = Variable<String>(cashflowEventId);
    map['tag_id'] = Variable<String>(tagId);
    return map;
  }

  CashflowEventTagsCompanion toCompanion(bool nullToAbsent) {
    return CashflowEventTagsCompanion(
      cashflowEventId: Value(cashflowEventId),
      tagId: Value(tagId),
    );
  }

  factory CashflowEventTagRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return CashflowEventTagRow(
      cashflowEventId: serializer.fromJson<String>(json['cashflowEventId']),
      tagId: serializer.fromJson<String>(json['tagId']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'cashflowEventId': serializer.toJson<String>(cashflowEventId),
      'tagId': serializer.toJson<String>(tagId),
    };
  }

  CashflowEventTagRow copyWith({String? cashflowEventId, String? tagId}) =>
      CashflowEventTagRow(
        cashflowEventId: cashflowEventId ?? this.cashflowEventId,
        tagId: tagId ?? this.tagId,
      );
  CashflowEventTagRow copyWithCompanion(CashflowEventTagsCompanion data) {
    return CashflowEventTagRow(
      cashflowEventId: data.cashflowEventId.present
          ? data.cashflowEventId.value
          : this.cashflowEventId,
      tagId: data.tagId.present ? data.tagId.value : this.tagId,
    );
  }

  @override
  String toString() {
    return (StringBuffer('CashflowEventTagRow(')
          ..write('cashflowEventId: $cashflowEventId, ')
          ..write('tagId: $tagId')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(cashflowEventId, tagId);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is CashflowEventTagRow &&
          other.cashflowEventId == this.cashflowEventId &&
          other.tagId == this.tagId);
}

class CashflowEventTagsCompanion extends UpdateCompanion<CashflowEventTagRow> {
  final Value<String> cashflowEventId;
  final Value<String> tagId;
  final Value<int> rowid;
  const CashflowEventTagsCompanion({
    this.cashflowEventId = const Value.absent(),
    this.tagId = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  CashflowEventTagsCompanion.insert({
    required String cashflowEventId,
    required String tagId,
    this.rowid = const Value.absent(),
  }) : cashflowEventId = Value(cashflowEventId),
       tagId = Value(tagId);
  static Insertable<CashflowEventTagRow> custom({
    Expression<String>? cashflowEventId,
    Expression<String>? tagId,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (cashflowEventId != null) 'cashflow_event_id': cashflowEventId,
      if (tagId != null) 'tag_id': tagId,
      if (rowid != null) 'rowid': rowid,
    });
  }

  CashflowEventTagsCompanion copyWith({
    Value<String>? cashflowEventId,
    Value<String>? tagId,
    Value<int>? rowid,
  }) {
    return CashflowEventTagsCompanion(
      cashflowEventId: cashflowEventId ?? this.cashflowEventId,
      tagId: tagId ?? this.tagId,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (cashflowEventId.present) {
      map['cashflow_event_id'] = Variable<String>(cashflowEventId.value);
    }
    if (tagId.present) {
      map['tag_id'] = Variable<String>(tagId.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('CashflowEventTagsCompanion(')
          ..write('cashflowEventId: $cashflowEventId, ')
          ..write('tagId: $tagId, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $AssetItemsTable extends AssetItems
    with TableInfo<$AssetItemsTable, AssetItemRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $AssetItemsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _assetTypeMeta = const VerificationMeta(
    'assetType',
  );
  @override
  late final GeneratedColumn<String> assetType = GeneratedColumn<String>(
    'asset_type',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _institutionMeta = const VerificationMeta(
    'institution',
  );
  @override
  late final GeneratedColumn<String> institution = GeneratedColumn<String>(
    'institution',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _defaultCurrencyMeta = const VerificationMeta(
    'defaultCurrency',
  );
  @override
  late final GeneratedColumn<String> defaultCurrency = GeneratedColumn<String>(
    'default_currency',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _valuationMethodMeta = const VerificationMeta(
    'valuationMethod',
  );
  @override
  late final GeneratedColumn<String> valuationMethod = GeneratedColumn<String>(
    'valuation_method',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _archivedAtMeta = const VerificationMeta(
    'archivedAt',
  );
  @override
  late final GeneratedColumn<String> archivedAt = GeneratedColumn<String>(
    'archived_at',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _displayOrderMeta = const VerificationMeta(
    'displayOrder',
  );
  @override
  late final GeneratedColumn<int> displayOrder = GeneratedColumn<int>(
    'display_order',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _noteMeta = const VerificationMeta('note');
  @override
  late final GeneratedColumn<String> note = GeneratedColumn<String>(
    'note',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<String> createdAt = GeneratedColumn<String>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<String> updatedAt = GeneratedColumn<String>(
    'updated_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    name,
    assetType,
    institution,
    defaultCurrency,
    valuationMethod,
    archivedAt,
    displayOrder,
    note,
    createdAt,
    updatedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'asset_items';
  @override
  VerificationContext validateIntegrity(
    Insertable<AssetItemRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('asset_type')) {
      context.handle(
        _assetTypeMeta,
        assetType.isAcceptableOrUnknown(data['asset_type']!, _assetTypeMeta),
      );
    } else if (isInserting) {
      context.missing(_assetTypeMeta);
    }
    if (data.containsKey('institution')) {
      context.handle(
        _institutionMeta,
        institution.isAcceptableOrUnknown(
          data['institution']!,
          _institutionMeta,
        ),
      );
    }
    if (data.containsKey('default_currency')) {
      context.handle(
        _defaultCurrencyMeta,
        defaultCurrency.isAcceptableOrUnknown(
          data['default_currency']!,
          _defaultCurrencyMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_defaultCurrencyMeta);
    }
    if (data.containsKey('valuation_method')) {
      context.handle(
        _valuationMethodMeta,
        valuationMethod.isAcceptableOrUnknown(
          data['valuation_method']!,
          _valuationMethodMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_valuationMethodMeta);
    }
    if (data.containsKey('archived_at')) {
      context.handle(
        _archivedAtMeta,
        archivedAt.isAcceptableOrUnknown(data['archived_at']!, _archivedAtMeta),
      );
    }
    if (data.containsKey('display_order')) {
      context.handle(
        _displayOrderMeta,
        displayOrder.isAcceptableOrUnknown(
          data['display_order']!,
          _displayOrderMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_displayOrderMeta);
    }
    if (data.containsKey('note')) {
      context.handle(
        _noteMeta,
        note.isAcceptableOrUnknown(data['note']!, _noteMeta),
      );
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  AssetItemRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return AssetItemRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      assetType: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}asset_type'],
      )!,
      institution: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}institution'],
      ),
      defaultCurrency: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}default_currency'],
      )!,
      valuationMethod: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}valuation_method'],
      )!,
      archivedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}archived_at'],
      ),
      displayOrder: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}display_order'],
      )!,
      note: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}note'],
      ),
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}created_at'],
      )!,
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}updated_at'],
      )!,
    );
  }

  @override
  $AssetItemsTable createAlias(String alias) {
    return $AssetItemsTable(attachedDatabase, alias);
  }
}

class AssetItemRow extends DataClass implements Insertable<AssetItemRow> {
  final String id;
  final String name;
  final String assetType;
  final String? institution;
  final String defaultCurrency;
  final String valuationMethod;
  final String? archivedAt;
  final int displayOrder;
  final String? note;
  final String createdAt;
  final String updatedAt;
  const AssetItemRow({
    required this.id,
    required this.name,
    required this.assetType,
    this.institution,
    required this.defaultCurrency,
    required this.valuationMethod,
    this.archivedAt,
    required this.displayOrder,
    this.note,
    required this.createdAt,
    required this.updatedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['name'] = Variable<String>(name);
    map['asset_type'] = Variable<String>(assetType);
    if (!nullToAbsent || institution != null) {
      map['institution'] = Variable<String>(institution);
    }
    map['default_currency'] = Variable<String>(defaultCurrency);
    map['valuation_method'] = Variable<String>(valuationMethod);
    if (!nullToAbsent || archivedAt != null) {
      map['archived_at'] = Variable<String>(archivedAt);
    }
    map['display_order'] = Variable<int>(displayOrder);
    if (!nullToAbsent || note != null) {
      map['note'] = Variable<String>(note);
    }
    map['created_at'] = Variable<String>(createdAt);
    map['updated_at'] = Variable<String>(updatedAt);
    return map;
  }

  AssetItemsCompanion toCompanion(bool nullToAbsent) {
    return AssetItemsCompanion(
      id: Value(id),
      name: Value(name),
      assetType: Value(assetType),
      institution: institution == null && nullToAbsent
          ? const Value.absent()
          : Value(institution),
      defaultCurrency: Value(defaultCurrency),
      valuationMethod: Value(valuationMethod),
      archivedAt: archivedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(archivedAt),
      displayOrder: Value(displayOrder),
      note: note == null && nullToAbsent ? const Value.absent() : Value(note),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
    );
  }

  factory AssetItemRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return AssetItemRow(
      id: serializer.fromJson<String>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      assetType: serializer.fromJson<String>(json['assetType']),
      institution: serializer.fromJson<String?>(json['institution']),
      defaultCurrency: serializer.fromJson<String>(json['defaultCurrency']),
      valuationMethod: serializer.fromJson<String>(json['valuationMethod']),
      archivedAt: serializer.fromJson<String?>(json['archivedAt']),
      displayOrder: serializer.fromJson<int>(json['displayOrder']),
      note: serializer.fromJson<String?>(json['note']),
      createdAt: serializer.fromJson<String>(json['createdAt']),
      updatedAt: serializer.fromJson<String>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'name': serializer.toJson<String>(name),
      'assetType': serializer.toJson<String>(assetType),
      'institution': serializer.toJson<String?>(institution),
      'defaultCurrency': serializer.toJson<String>(defaultCurrency),
      'valuationMethod': serializer.toJson<String>(valuationMethod),
      'archivedAt': serializer.toJson<String?>(archivedAt),
      'displayOrder': serializer.toJson<int>(displayOrder),
      'note': serializer.toJson<String?>(note),
      'createdAt': serializer.toJson<String>(createdAt),
      'updatedAt': serializer.toJson<String>(updatedAt),
    };
  }

  AssetItemRow copyWith({
    String? id,
    String? name,
    String? assetType,
    Value<String?> institution = const Value.absent(),
    String? defaultCurrency,
    String? valuationMethod,
    Value<String?> archivedAt = const Value.absent(),
    int? displayOrder,
    Value<String?> note = const Value.absent(),
    String? createdAt,
    String? updatedAt,
  }) => AssetItemRow(
    id: id ?? this.id,
    name: name ?? this.name,
    assetType: assetType ?? this.assetType,
    institution: institution.present ? institution.value : this.institution,
    defaultCurrency: defaultCurrency ?? this.defaultCurrency,
    valuationMethod: valuationMethod ?? this.valuationMethod,
    archivedAt: archivedAt.present ? archivedAt.value : this.archivedAt,
    displayOrder: displayOrder ?? this.displayOrder,
    note: note.present ? note.value : this.note,
    createdAt: createdAt ?? this.createdAt,
    updatedAt: updatedAt ?? this.updatedAt,
  );
  AssetItemRow copyWithCompanion(AssetItemsCompanion data) {
    return AssetItemRow(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      assetType: data.assetType.present ? data.assetType.value : this.assetType,
      institution: data.institution.present
          ? data.institution.value
          : this.institution,
      defaultCurrency: data.defaultCurrency.present
          ? data.defaultCurrency.value
          : this.defaultCurrency,
      valuationMethod: data.valuationMethod.present
          ? data.valuationMethod.value
          : this.valuationMethod,
      archivedAt: data.archivedAt.present
          ? data.archivedAt.value
          : this.archivedAt,
      displayOrder: data.displayOrder.present
          ? data.displayOrder.value
          : this.displayOrder,
      note: data.note.present ? data.note.value : this.note,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('AssetItemRow(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('assetType: $assetType, ')
          ..write('institution: $institution, ')
          ..write('defaultCurrency: $defaultCurrency, ')
          ..write('valuationMethod: $valuationMethod, ')
          ..write('archivedAt: $archivedAt, ')
          ..write('displayOrder: $displayOrder, ')
          ..write('note: $note, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    name,
    assetType,
    institution,
    defaultCurrency,
    valuationMethod,
    archivedAt,
    displayOrder,
    note,
    createdAt,
    updatedAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is AssetItemRow &&
          other.id == this.id &&
          other.name == this.name &&
          other.assetType == this.assetType &&
          other.institution == this.institution &&
          other.defaultCurrency == this.defaultCurrency &&
          other.valuationMethod == this.valuationMethod &&
          other.archivedAt == this.archivedAt &&
          other.displayOrder == this.displayOrder &&
          other.note == this.note &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class AssetItemsCompanion extends UpdateCompanion<AssetItemRow> {
  final Value<String> id;
  final Value<String> name;
  final Value<String> assetType;
  final Value<String?> institution;
  final Value<String> defaultCurrency;
  final Value<String> valuationMethod;
  final Value<String?> archivedAt;
  final Value<int> displayOrder;
  final Value<String?> note;
  final Value<String> createdAt;
  final Value<String> updatedAt;
  final Value<int> rowid;
  const AssetItemsCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.assetType = const Value.absent(),
    this.institution = const Value.absent(),
    this.defaultCurrency = const Value.absent(),
    this.valuationMethod = const Value.absent(),
    this.archivedAt = const Value.absent(),
    this.displayOrder = const Value.absent(),
    this.note = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  AssetItemsCompanion.insert({
    required String id,
    required String name,
    required String assetType,
    this.institution = const Value.absent(),
    required String defaultCurrency,
    required String valuationMethod,
    this.archivedAt = const Value.absent(),
    required int displayOrder,
    this.note = const Value.absent(),
    required String createdAt,
    required String updatedAt,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       name = Value(name),
       assetType = Value(assetType),
       defaultCurrency = Value(defaultCurrency),
       valuationMethod = Value(valuationMethod),
       displayOrder = Value(displayOrder),
       createdAt = Value(createdAt),
       updatedAt = Value(updatedAt);
  static Insertable<AssetItemRow> custom({
    Expression<String>? id,
    Expression<String>? name,
    Expression<String>? assetType,
    Expression<String>? institution,
    Expression<String>? defaultCurrency,
    Expression<String>? valuationMethod,
    Expression<String>? archivedAt,
    Expression<int>? displayOrder,
    Expression<String>? note,
    Expression<String>? createdAt,
    Expression<String>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (assetType != null) 'asset_type': assetType,
      if (institution != null) 'institution': institution,
      if (defaultCurrency != null) 'default_currency': defaultCurrency,
      if (valuationMethod != null) 'valuation_method': valuationMethod,
      if (archivedAt != null) 'archived_at': archivedAt,
      if (displayOrder != null) 'display_order': displayOrder,
      if (note != null) 'note': note,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  AssetItemsCompanion copyWith({
    Value<String>? id,
    Value<String>? name,
    Value<String>? assetType,
    Value<String?>? institution,
    Value<String>? defaultCurrency,
    Value<String>? valuationMethod,
    Value<String?>? archivedAt,
    Value<int>? displayOrder,
    Value<String?>? note,
    Value<String>? createdAt,
    Value<String>? updatedAt,
    Value<int>? rowid,
  }) {
    return AssetItemsCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      assetType: assetType ?? this.assetType,
      institution: institution ?? this.institution,
      defaultCurrency: defaultCurrency ?? this.defaultCurrency,
      valuationMethod: valuationMethod ?? this.valuationMethod,
      archivedAt: archivedAt ?? this.archivedAt,
      displayOrder: displayOrder ?? this.displayOrder,
      note: note ?? this.note,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (assetType.present) {
      map['asset_type'] = Variable<String>(assetType.value);
    }
    if (institution.present) {
      map['institution'] = Variable<String>(institution.value);
    }
    if (defaultCurrency.present) {
      map['default_currency'] = Variable<String>(defaultCurrency.value);
    }
    if (valuationMethod.present) {
      map['valuation_method'] = Variable<String>(valuationMethod.value);
    }
    if (archivedAt.present) {
      map['archived_at'] = Variable<String>(archivedAt.value);
    }
    if (displayOrder.present) {
      map['display_order'] = Variable<int>(displayOrder.value);
    }
    if (note.present) {
      map['note'] = Variable<String>(note.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<String>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<String>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('AssetItemsCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('assetType: $assetType, ')
          ..write('institution: $institution, ')
          ..write('defaultCurrency: $defaultCurrency, ')
          ..write('valuationMethod: $valuationMethod, ')
          ..write('archivedAt: $archivedAt, ')
          ..write('displayOrder: $displayOrder, ')
          ..write('note: $note, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $AssetSnapshotsTable extends AssetSnapshots
    with TableInfo<$AssetSnapshotsTable, AssetSnapshotRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $AssetSnapshotsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _assetItemIdMeta = const VerificationMeta(
    'assetItemId',
  );
  @override
  late final GeneratedColumn<String> assetItemId = GeneratedColumn<String>(
    'asset_item_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _snapshotAtMeta = const VerificationMeta(
    'snapshotAt',
  );
  @override
  late final GeneratedColumn<String> snapshotAt = GeneratedColumn<String>(
    'snapshot_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _valueAmountMeta = const VerificationMeta(
    'valueAmount',
  );
  @override
  late final GeneratedColumn<String> valueAmount = GeneratedColumn<String>(
    'value_amount',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _valueCurrencyMeta = const VerificationMeta(
    'valueCurrency',
  );
  @override
  late final GeneratedColumn<String> valueCurrency = GeneratedColumn<String>(
    'value_currency',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _noteMeta = const VerificationMeta('note');
  @override
  late final GeneratedColumn<String> note = GeneratedColumn<String>(
    'note',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<String> createdAt = GeneratedColumn<String>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    assetItemId,
    snapshotAt,
    valueAmount,
    valueCurrency,
    note,
    createdAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'asset_snapshots';
  @override
  VerificationContext validateIntegrity(
    Insertable<AssetSnapshotRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('asset_item_id')) {
      context.handle(
        _assetItemIdMeta,
        assetItemId.isAcceptableOrUnknown(
          data['asset_item_id']!,
          _assetItemIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_assetItemIdMeta);
    }
    if (data.containsKey('snapshot_at')) {
      context.handle(
        _snapshotAtMeta,
        snapshotAt.isAcceptableOrUnknown(data['snapshot_at']!, _snapshotAtMeta),
      );
    } else if (isInserting) {
      context.missing(_snapshotAtMeta);
    }
    if (data.containsKey('value_amount')) {
      context.handle(
        _valueAmountMeta,
        valueAmount.isAcceptableOrUnknown(
          data['value_amount']!,
          _valueAmountMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_valueAmountMeta);
    }
    if (data.containsKey('value_currency')) {
      context.handle(
        _valueCurrencyMeta,
        valueCurrency.isAcceptableOrUnknown(
          data['value_currency']!,
          _valueCurrencyMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_valueCurrencyMeta);
    }
    if (data.containsKey('note')) {
      context.handle(
        _noteMeta,
        note.isAcceptableOrUnknown(data['note']!, _noteMeta),
      );
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  AssetSnapshotRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return AssetSnapshotRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      assetItemId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}asset_item_id'],
      )!,
      snapshotAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}snapshot_at'],
      )!,
      valueAmount: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}value_amount'],
      )!,
      valueCurrency: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}value_currency'],
      )!,
      note: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}note'],
      ),
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}created_at'],
      )!,
    );
  }

  @override
  $AssetSnapshotsTable createAlias(String alias) {
    return $AssetSnapshotsTable(attachedDatabase, alias);
  }
}

class AssetSnapshotRow extends DataClass
    implements Insertable<AssetSnapshotRow> {
  final String id;
  final String assetItemId;
  final String snapshotAt;
  final String valueAmount;
  final String valueCurrency;
  final String? note;
  final String createdAt;
  const AssetSnapshotRow({
    required this.id,
    required this.assetItemId,
    required this.snapshotAt,
    required this.valueAmount,
    required this.valueCurrency,
    this.note,
    required this.createdAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['asset_item_id'] = Variable<String>(assetItemId);
    map['snapshot_at'] = Variable<String>(snapshotAt);
    map['value_amount'] = Variable<String>(valueAmount);
    map['value_currency'] = Variable<String>(valueCurrency);
    if (!nullToAbsent || note != null) {
      map['note'] = Variable<String>(note);
    }
    map['created_at'] = Variable<String>(createdAt);
    return map;
  }

  AssetSnapshotsCompanion toCompanion(bool nullToAbsent) {
    return AssetSnapshotsCompanion(
      id: Value(id),
      assetItemId: Value(assetItemId),
      snapshotAt: Value(snapshotAt),
      valueAmount: Value(valueAmount),
      valueCurrency: Value(valueCurrency),
      note: note == null && nullToAbsent ? const Value.absent() : Value(note),
      createdAt: Value(createdAt),
    );
  }

  factory AssetSnapshotRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return AssetSnapshotRow(
      id: serializer.fromJson<String>(json['id']),
      assetItemId: serializer.fromJson<String>(json['assetItemId']),
      snapshotAt: serializer.fromJson<String>(json['snapshotAt']),
      valueAmount: serializer.fromJson<String>(json['valueAmount']),
      valueCurrency: serializer.fromJson<String>(json['valueCurrency']),
      note: serializer.fromJson<String?>(json['note']),
      createdAt: serializer.fromJson<String>(json['createdAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'assetItemId': serializer.toJson<String>(assetItemId),
      'snapshotAt': serializer.toJson<String>(snapshotAt),
      'valueAmount': serializer.toJson<String>(valueAmount),
      'valueCurrency': serializer.toJson<String>(valueCurrency),
      'note': serializer.toJson<String?>(note),
      'createdAt': serializer.toJson<String>(createdAt),
    };
  }

  AssetSnapshotRow copyWith({
    String? id,
    String? assetItemId,
    String? snapshotAt,
    String? valueAmount,
    String? valueCurrency,
    Value<String?> note = const Value.absent(),
    String? createdAt,
  }) => AssetSnapshotRow(
    id: id ?? this.id,
    assetItemId: assetItemId ?? this.assetItemId,
    snapshotAt: snapshotAt ?? this.snapshotAt,
    valueAmount: valueAmount ?? this.valueAmount,
    valueCurrency: valueCurrency ?? this.valueCurrency,
    note: note.present ? note.value : this.note,
    createdAt: createdAt ?? this.createdAt,
  );
  AssetSnapshotRow copyWithCompanion(AssetSnapshotsCompanion data) {
    return AssetSnapshotRow(
      id: data.id.present ? data.id.value : this.id,
      assetItemId: data.assetItemId.present
          ? data.assetItemId.value
          : this.assetItemId,
      snapshotAt: data.snapshotAt.present
          ? data.snapshotAt.value
          : this.snapshotAt,
      valueAmount: data.valueAmount.present
          ? data.valueAmount.value
          : this.valueAmount,
      valueCurrency: data.valueCurrency.present
          ? data.valueCurrency.value
          : this.valueCurrency,
      note: data.note.present ? data.note.value : this.note,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('AssetSnapshotRow(')
          ..write('id: $id, ')
          ..write('assetItemId: $assetItemId, ')
          ..write('snapshotAt: $snapshotAt, ')
          ..write('valueAmount: $valueAmount, ')
          ..write('valueCurrency: $valueCurrency, ')
          ..write('note: $note, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    assetItemId,
    snapshotAt,
    valueAmount,
    valueCurrency,
    note,
    createdAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is AssetSnapshotRow &&
          other.id == this.id &&
          other.assetItemId == this.assetItemId &&
          other.snapshotAt == this.snapshotAt &&
          other.valueAmount == this.valueAmount &&
          other.valueCurrency == this.valueCurrency &&
          other.note == this.note &&
          other.createdAt == this.createdAt);
}

class AssetSnapshotsCompanion extends UpdateCompanion<AssetSnapshotRow> {
  final Value<String> id;
  final Value<String> assetItemId;
  final Value<String> snapshotAt;
  final Value<String> valueAmount;
  final Value<String> valueCurrency;
  final Value<String?> note;
  final Value<String> createdAt;
  final Value<int> rowid;
  const AssetSnapshotsCompanion({
    this.id = const Value.absent(),
    this.assetItemId = const Value.absent(),
    this.snapshotAt = const Value.absent(),
    this.valueAmount = const Value.absent(),
    this.valueCurrency = const Value.absent(),
    this.note = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  AssetSnapshotsCompanion.insert({
    required String id,
    required String assetItemId,
    required String snapshotAt,
    required String valueAmount,
    required String valueCurrency,
    this.note = const Value.absent(),
    required String createdAt,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       assetItemId = Value(assetItemId),
       snapshotAt = Value(snapshotAt),
       valueAmount = Value(valueAmount),
       valueCurrency = Value(valueCurrency),
       createdAt = Value(createdAt);
  static Insertable<AssetSnapshotRow> custom({
    Expression<String>? id,
    Expression<String>? assetItemId,
    Expression<String>? snapshotAt,
    Expression<String>? valueAmount,
    Expression<String>? valueCurrency,
    Expression<String>? note,
    Expression<String>? createdAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (assetItemId != null) 'asset_item_id': assetItemId,
      if (snapshotAt != null) 'snapshot_at': snapshotAt,
      if (valueAmount != null) 'value_amount': valueAmount,
      if (valueCurrency != null) 'value_currency': valueCurrency,
      if (note != null) 'note': note,
      if (createdAt != null) 'created_at': createdAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  AssetSnapshotsCompanion copyWith({
    Value<String>? id,
    Value<String>? assetItemId,
    Value<String>? snapshotAt,
    Value<String>? valueAmount,
    Value<String>? valueCurrency,
    Value<String?>? note,
    Value<String>? createdAt,
    Value<int>? rowid,
  }) {
    return AssetSnapshotsCompanion(
      id: id ?? this.id,
      assetItemId: assetItemId ?? this.assetItemId,
      snapshotAt: snapshotAt ?? this.snapshotAt,
      valueAmount: valueAmount ?? this.valueAmount,
      valueCurrency: valueCurrency ?? this.valueCurrency,
      note: note ?? this.note,
      createdAt: createdAt ?? this.createdAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (assetItemId.present) {
      map['asset_item_id'] = Variable<String>(assetItemId.value);
    }
    if (snapshotAt.present) {
      map['snapshot_at'] = Variable<String>(snapshotAt.value);
    }
    if (valueAmount.present) {
      map['value_amount'] = Variable<String>(valueAmount.value);
    }
    if (valueCurrency.present) {
      map['value_currency'] = Variable<String>(valueCurrency.value);
    }
    if (note.present) {
      map['note'] = Variable<String>(note.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<String>(createdAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('AssetSnapshotsCompanion(')
          ..write('id: $id, ')
          ..write('assetItemId: $assetItemId, ')
          ..write('snapshotAt: $snapshotAt, ')
          ..write('valueAmount: $valueAmount, ')
          ..write('valueCurrency: $valueCurrency, ')
          ..write('note: $note, ')
          ..write('createdAt: $createdAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SubscriptionsTable extends Subscriptions
    with TableInfo<$SubscriptionsTable, SubscriptionRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SubscriptionsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _merchantMeta = const VerificationMeta(
    'merchant',
  );
  @override
  late final GeneratedColumn<String> merchant = GeneratedColumn<String>(
    'merchant',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _amountMeta = const VerificationMeta('amount');
  @override
  late final GeneratedColumn<String> amount = GeneratedColumn<String>(
    'amount',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _currencyMeta = const VerificationMeta(
    'currency',
  );
  @override
  late final GeneratedColumn<String> currency = GeneratedColumn<String>(
    'currency',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _billingCycleMeta = const VerificationMeta(
    'billingCycle',
  );
  @override
  late final GeneratedColumn<String> billingCycle = GeneratedColumn<String>(
    'billing_cycle',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _intervalCountMeta = const VerificationMeta(
    'intervalCount',
  );
  @override
  late final GeneratedColumn<int> intervalCount = GeneratedColumn<int>(
    'interval_count',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _nextChargeDateMeta = const VerificationMeta(
    'nextChargeDate',
  );
  @override
  late final GeneratedColumn<String> nextChargeDate = GeneratedColumn<String>(
    'next_charge_date',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _autoRenewMeta = const VerificationMeta(
    'autoRenew',
  );
  @override
  late final GeneratedColumn<bool> autoRenew = GeneratedColumn<bool>(
    'auto_renew',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: true,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("auto_renew" IN (0, 1))',
    ),
  );
  static const VerificationMeta _categoryIdMeta = const VerificationMeta(
    'categoryId',
  );
  @override
  late final GeneratedColumn<String> categoryId = GeneratedColumn<String>(
    'category_id',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
    'status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _noteMeta = const VerificationMeta('note');
  @override
  late final GeneratedColumn<String> note = GeneratedColumn<String>(
    'note',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<String> createdAt = GeneratedColumn<String>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<String> updatedAt = GeneratedColumn<String>(
    'updated_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    name,
    merchant,
    amount,
    currency,
    billingCycle,
    intervalCount,
    nextChargeDate,
    autoRenew,
    categoryId,
    status,
    note,
    createdAt,
    updatedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'subscriptions';
  @override
  VerificationContext validateIntegrity(
    Insertable<SubscriptionRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('merchant')) {
      context.handle(
        _merchantMeta,
        merchant.isAcceptableOrUnknown(data['merchant']!, _merchantMeta),
      );
    }
    if (data.containsKey('amount')) {
      context.handle(
        _amountMeta,
        amount.isAcceptableOrUnknown(data['amount']!, _amountMeta),
      );
    } else if (isInserting) {
      context.missing(_amountMeta);
    }
    if (data.containsKey('currency')) {
      context.handle(
        _currencyMeta,
        currency.isAcceptableOrUnknown(data['currency']!, _currencyMeta),
      );
    } else if (isInserting) {
      context.missing(_currencyMeta);
    }
    if (data.containsKey('billing_cycle')) {
      context.handle(
        _billingCycleMeta,
        billingCycle.isAcceptableOrUnknown(
          data['billing_cycle']!,
          _billingCycleMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_billingCycleMeta);
    }
    if (data.containsKey('interval_count')) {
      context.handle(
        _intervalCountMeta,
        intervalCount.isAcceptableOrUnknown(
          data['interval_count']!,
          _intervalCountMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_intervalCountMeta);
    }
    if (data.containsKey('next_charge_date')) {
      context.handle(
        _nextChargeDateMeta,
        nextChargeDate.isAcceptableOrUnknown(
          data['next_charge_date']!,
          _nextChargeDateMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_nextChargeDateMeta);
    }
    if (data.containsKey('auto_renew')) {
      context.handle(
        _autoRenewMeta,
        autoRenew.isAcceptableOrUnknown(data['auto_renew']!, _autoRenewMeta),
      );
    } else if (isInserting) {
      context.missing(_autoRenewMeta);
    }
    if (data.containsKey('category_id')) {
      context.handle(
        _categoryIdMeta,
        categoryId.isAcceptableOrUnknown(data['category_id']!, _categoryIdMeta),
      );
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('note')) {
      context.handle(
        _noteMeta,
        note.isAcceptableOrUnknown(data['note']!, _noteMeta),
      );
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  SubscriptionRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SubscriptionRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      merchant: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}merchant'],
      ),
      amount: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}amount'],
      )!,
      currency: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}currency'],
      )!,
      billingCycle: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}billing_cycle'],
      )!,
      intervalCount: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}interval_count'],
      )!,
      nextChargeDate: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}next_charge_date'],
      )!,
      autoRenew: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}auto_renew'],
      )!,
      categoryId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}category_id'],
      ),
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
      note: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}note'],
      ),
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}created_at'],
      )!,
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}updated_at'],
      )!,
    );
  }

  @override
  $SubscriptionsTable createAlias(String alias) {
    return $SubscriptionsTable(attachedDatabase, alias);
  }
}

class SubscriptionRow extends DataClass implements Insertable<SubscriptionRow> {
  final String id;
  final String name;
  final String? merchant;
  final String amount;
  final String currency;
  final String billingCycle;
  final int intervalCount;
  final String nextChargeDate;
  final bool autoRenew;
  final String? categoryId;
  final String status;
  final String? note;
  final String createdAt;
  final String updatedAt;
  const SubscriptionRow({
    required this.id,
    required this.name,
    this.merchant,
    required this.amount,
    required this.currency,
    required this.billingCycle,
    required this.intervalCount,
    required this.nextChargeDate,
    required this.autoRenew,
    this.categoryId,
    required this.status,
    this.note,
    required this.createdAt,
    required this.updatedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['name'] = Variable<String>(name);
    if (!nullToAbsent || merchant != null) {
      map['merchant'] = Variable<String>(merchant);
    }
    map['amount'] = Variable<String>(amount);
    map['currency'] = Variable<String>(currency);
    map['billing_cycle'] = Variable<String>(billingCycle);
    map['interval_count'] = Variable<int>(intervalCount);
    map['next_charge_date'] = Variable<String>(nextChargeDate);
    map['auto_renew'] = Variable<bool>(autoRenew);
    if (!nullToAbsent || categoryId != null) {
      map['category_id'] = Variable<String>(categoryId);
    }
    map['status'] = Variable<String>(status);
    if (!nullToAbsent || note != null) {
      map['note'] = Variable<String>(note);
    }
    map['created_at'] = Variable<String>(createdAt);
    map['updated_at'] = Variable<String>(updatedAt);
    return map;
  }

  SubscriptionsCompanion toCompanion(bool nullToAbsent) {
    return SubscriptionsCompanion(
      id: Value(id),
      name: Value(name),
      merchant: merchant == null && nullToAbsent
          ? const Value.absent()
          : Value(merchant),
      amount: Value(amount),
      currency: Value(currency),
      billingCycle: Value(billingCycle),
      intervalCount: Value(intervalCount),
      nextChargeDate: Value(nextChargeDate),
      autoRenew: Value(autoRenew),
      categoryId: categoryId == null && nullToAbsent
          ? const Value.absent()
          : Value(categoryId),
      status: Value(status),
      note: note == null && nullToAbsent ? const Value.absent() : Value(note),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
    );
  }

  factory SubscriptionRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SubscriptionRow(
      id: serializer.fromJson<String>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      merchant: serializer.fromJson<String?>(json['merchant']),
      amount: serializer.fromJson<String>(json['amount']),
      currency: serializer.fromJson<String>(json['currency']),
      billingCycle: serializer.fromJson<String>(json['billingCycle']),
      intervalCount: serializer.fromJson<int>(json['intervalCount']),
      nextChargeDate: serializer.fromJson<String>(json['nextChargeDate']),
      autoRenew: serializer.fromJson<bool>(json['autoRenew']),
      categoryId: serializer.fromJson<String?>(json['categoryId']),
      status: serializer.fromJson<String>(json['status']),
      note: serializer.fromJson<String?>(json['note']),
      createdAt: serializer.fromJson<String>(json['createdAt']),
      updatedAt: serializer.fromJson<String>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'name': serializer.toJson<String>(name),
      'merchant': serializer.toJson<String?>(merchant),
      'amount': serializer.toJson<String>(amount),
      'currency': serializer.toJson<String>(currency),
      'billingCycle': serializer.toJson<String>(billingCycle),
      'intervalCount': serializer.toJson<int>(intervalCount),
      'nextChargeDate': serializer.toJson<String>(nextChargeDate),
      'autoRenew': serializer.toJson<bool>(autoRenew),
      'categoryId': serializer.toJson<String?>(categoryId),
      'status': serializer.toJson<String>(status),
      'note': serializer.toJson<String?>(note),
      'createdAt': serializer.toJson<String>(createdAt),
      'updatedAt': serializer.toJson<String>(updatedAt),
    };
  }

  SubscriptionRow copyWith({
    String? id,
    String? name,
    Value<String?> merchant = const Value.absent(),
    String? amount,
    String? currency,
    String? billingCycle,
    int? intervalCount,
    String? nextChargeDate,
    bool? autoRenew,
    Value<String?> categoryId = const Value.absent(),
    String? status,
    Value<String?> note = const Value.absent(),
    String? createdAt,
    String? updatedAt,
  }) => SubscriptionRow(
    id: id ?? this.id,
    name: name ?? this.name,
    merchant: merchant.present ? merchant.value : this.merchant,
    amount: amount ?? this.amount,
    currency: currency ?? this.currency,
    billingCycle: billingCycle ?? this.billingCycle,
    intervalCount: intervalCount ?? this.intervalCount,
    nextChargeDate: nextChargeDate ?? this.nextChargeDate,
    autoRenew: autoRenew ?? this.autoRenew,
    categoryId: categoryId.present ? categoryId.value : this.categoryId,
    status: status ?? this.status,
    note: note.present ? note.value : this.note,
    createdAt: createdAt ?? this.createdAt,
    updatedAt: updatedAt ?? this.updatedAt,
  );
  SubscriptionRow copyWithCompanion(SubscriptionsCompanion data) {
    return SubscriptionRow(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      merchant: data.merchant.present ? data.merchant.value : this.merchant,
      amount: data.amount.present ? data.amount.value : this.amount,
      currency: data.currency.present ? data.currency.value : this.currency,
      billingCycle: data.billingCycle.present
          ? data.billingCycle.value
          : this.billingCycle,
      intervalCount: data.intervalCount.present
          ? data.intervalCount.value
          : this.intervalCount,
      nextChargeDate: data.nextChargeDate.present
          ? data.nextChargeDate.value
          : this.nextChargeDate,
      autoRenew: data.autoRenew.present ? data.autoRenew.value : this.autoRenew,
      categoryId: data.categoryId.present
          ? data.categoryId.value
          : this.categoryId,
      status: data.status.present ? data.status.value : this.status,
      note: data.note.present ? data.note.value : this.note,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SubscriptionRow(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('merchant: $merchant, ')
          ..write('amount: $amount, ')
          ..write('currency: $currency, ')
          ..write('billingCycle: $billingCycle, ')
          ..write('intervalCount: $intervalCount, ')
          ..write('nextChargeDate: $nextChargeDate, ')
          ..write('autoRenew: $autoRenew, ')
          ..write('categoryId: $categoryId, ')
          ..write('status: $status, ')
          ..write('note: $note, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    name,
    merchant,
    amount,
    currency,
    billingCycle,
    intervalCount,
    nextChargeDate,
    autoRenew,
    categoryId,
    status,
    note,
    createdAt,
    updatedAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SubscriptionRow &&
          other.id == this.id &&
          other.name == this.name &&
          other.merchant == this.merchant &&
          other.amount == this.amount &&
          other.currency == this.currency &&
          other.billingCycle == this.billingCycle &&
          other.intervalCount == this.intervalCount &&
          other.nextChargeDate == this.nextChargeDate &&
          other.autoRenew == this.autoRenew &&
          other.categoryId == this.categoryId &&
          other.status == this.status &&
          other.note == this.note &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class SubscriptionsCompanion extends UpdateCompanion<SubscriptionRow> {
  final Value<String> id;
  final Value<String> name;
  final Value<String?> merchant;
  final Value<String> amount;
  final Value<String> currency;
  final Value<String> billingCycle;
  final Value<int> intervalCount;
  final Value<String> nextChargeDate;
  final Value<bool> autoRenew;
  final Value<String?> categoryId;
  final Value<String> status;
  final Value<String?> note;
  final Value<String> createdAt;
  final Value<String> updatedAt;
  final Value<int> rowid;
  const SubscriptionsCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.merchant = const Value.absent(),
    this.amount = const Value.absent(),
    this.currency = const Value.absent(),
    this.billingCycle = const Value.absent(),
    this.intervalCount = const Value.absent(),
    this.nextChargeDate = const Value.absent(),
    this.autoRenew = const Value.absent(),
    this.categoryId = const Value.absent(),
    this.status = const Value.absent(),
    this.note = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SubscriptionsCompanion.insert({
    required String id,
    required String name,
    this.merchant = const Value.absent(),
    required String amount,
    required String currency,
    required String billingCycle,
    required int intervalCount,
    required String nextChargeDate,
    required bool autoRenew,
    this.categoryId = const Value.absent(),
    required String status,
    this.note = const Value.absent(),
    required String createdAt,
    required String updatedAt,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       name = Value(name),
       amount = Value(amount),
       currency = Value(currency),
       billingCycle = Value(billingCycle),
       intervalCount = Value(intervalCount),
       nextChargeDate = Value(nextChargeDate),
       autoRenew = Value(autoRenew),
       status = Value(status),
       createdAt = Value(createdAt),
       updatedAt = Value(updatedAt);
  static Insertable<SubscriptionRow> custom({
    Expression<String>? id,
    Expression<String>? name,
    Expression<String>? merchant,
    Expression<String>? amount,
    Expression<String>? currency,
    Expression<String>? billingCycle,
    Expression<int>? intervalCount,
    Expression<String>? nextChargeDate,
    Expression<bool>? autoRenew,
    Expression<String>? categoryId,
    Expression<String>? status,
    Expression<String>? note,
    Expression<String>? createdAt,
    Expression<String>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (merchant != null) 'merchant': merchant,
      if (amount != null) 'amount': amount,
      if (currency != null) 'currency': currency,
      if (billingCycle != null) 'billing_cycle': billingCycle,
      if (intervalCount != null) 'interval_count': intervalCount,
      if (nextChargeDate != null) 'next_charge_date': nextChargeDate,
      if (autoRenew != null) 'auto_renew': autoRenew,
      if (categoryId != null) 'category_id': categoryId,
      if (status != null) 'status': status,
      if (note != null) 'note': note,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SubscriptionsCompanion copyWith({
    Value<String>? id,
    Value<String>? name,
    Value<String?>? merchant,
    Value<String>? amount,
    Value<String>? currency,
    Value<String>? billingCycle,
    Value<int>? intervalCount,
    Value<String>? nextChargeDate,
    Value<bool>? autoRenew,
    Value<String?>? categoryId,
    Value<String>? status,
    Value<String?>? note,
    Value<String>? createdAt,
    Value<String>? updatedAt,
    Value<int>? rowid,
  }) {
    return SubscriptionsCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      merchant: merchant ?? this.merchant,
      amount: amount ?? this.amount,
      currency: currency ?? this.currency,
      billingCycle: billingCycle ?? this.billingCycle,
      intervalCount: intervalCount ?? this.intervalCount,
      nextChargeDate: nextChargeDate ?? this.nextChargeDate,
      autoRenew: autoRenew ?? this.autoRenew,
      categoryId: categoryId ?? this.categoryId,
      status: status ?? this.status,
      note: note ?? this.note,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (merchant.present) {
      map['merchant'] = Variable<String>(merchant.value);
    }
    if (amount.present) {
      map['amount'] = Variable<String>(amount.value);
    }
    if (currency.present) {
      map['currency'] = Variable<String>(currency.value);
    }
    if (billingCycle.present) {
      map['billing_cycle'] = Variable<String>(billingCycle.value);
    }
    if (intervalCount.present) {
      map['interval_count'] = Variable<int>(intervalCount.value);
    }
    if (nextChargeDate.present) {
      map['next_charge_date'] = Variable<String>(nextChargeDate.value);
    }
    if (autoRenew.present) {
      map['auto_renew'] = Variable<bool>(autoRenew.value);
    }
    if (categoryId.present) {
      map['category_id'] = Variable<String>(categoryId.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (note.present) {
      map['note'] = Variable<String>(note.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<String>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<String>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SubscriptionsCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('merchant: $merchant, ')
          ..write('amount: $amount, ')
          ..write('currency: $currency, ')
          ..write('billingCycle: $billingCycle, ')
          ..write('intervalCount: $intervalCount, ')
          ..write('nextChargeDate: $nextChargeDate, ')
          ..write('autoRenew: $autoRenew, ')
          ..write('categoryId: $categoryId, ')
          ..write('status: $status, ')
          ..write('note: $note, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SubscriptionOccurrencesTable extends SubscriptionOccurrences
    with TableInfo<$SubscriptionOccurrencesTable, SubscriptionOccurrenceRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SubscriptionOccurrencesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _subscriptionIdMeta = const VerificationMeta(
    'subscriptionId',
  );
  @override
  late final GeneratedColumn<String> subscriptionId = GeneratedColumn<String>(
    'subscription_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _dueDateMeta = const VerificationMeta(
    'dueDate',
  );
  @override
  late final GeneratedColumn<String> dueDate = GeneratedColumn<String>(
    'due_date',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _amountMeta = const VerificationMeta('amount');
  @override
  late final GeneratedColumn<String> amount = GeneratedColumn<String>(
    'amount',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _currencyMeta = const VerificationMeta(
    'currency',
  );
  @override
  late final GeneratedColumn<String> currency = GeneratedColumn<String>(
    'currency',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
    'status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<String> createdAt = GeneratedColumn<String>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    subscriptionId,
    dueDate,
    amount,
    currency,
    status,
    createdAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'subscription_occurrences';
  @override
  VerificationContext validateIntegrity(
    Insertable<SubscriptionOccurrenceRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('subscription_id')) {
      context.handle(
        _subscriptionIdMeta,
        subscriptionId.isAcceptableOrUnknown(
          data['subscription_id']!,
          _subscriptionIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_subscriptionIdMeta);
    }
    if (data.containsKey('due_date')) {
      context.handle(
        _dueDateMeta,
        dueDate.isAcceptableOrUnknown(data['due_date']!, _dueDateMeta),
      );
    } else if (isInserting) {
      context.missing(_dueDateMeta);
    }
    if (data.containsKey('amount')) {
      context.handle(
        _amountMeta,
        amount.isAcceptableOrUnknown(data['amount']!, _amountMeta),
      );
    } else if (isInserting) {
      context.missing(_amountMeta);
    }
    if (data.containsKey('currency')) {
      context.handle(
        _currencyMeta,
        currency.isAcceptableOrUnknown(data['currency']!, _currencyMeta),
      );
    } else if (isInserting) {
      context.missing(_currencyMeta);
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  SubscriptionOccurrenceRow map(
    Map<String, dynamic> data, {
    String? tablePrefix,
  }) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SubscriptionOccurrenceRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      subscriptionId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}subscription_id'],
      )!,
      dueDate: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}due_date'],
      )!,
      amount: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}amount'],
      )!,
      currency: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}currency'],
      )!,
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}created_at'],
      )!,
    );
  }

  @override
  $SubscriptionOccurrencesTable createAlias(String alias) {
    return $SubscriptionOccurrencesTable(attachedDatabase, alias);
  }
}

class SubscriptionOccurrenceRow extends DataClass
    implements Insertable<SubscriptionOccurrenceRow> {
  final String id;
  final String subscriptionId;
  final String dueDate;
  final String amount;
  final String currency;
  final String status;
  final String createdAt;
  const SubscriptionOccurrenceRow({
    required this.id,
    required this.subscriptionId,
    required this.dueDate,
    required this.amount,
    required this.currency,
    required this.status,
    required this.createdAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['subscription_id'] = Variable<String>(subscriptionId);
    map['due_date'] = Variable<String>(dueDate);
    map['amount'] = Variable<String>(amount);
    map['currency'] = Variable<String>(currency);
    map['status'] = Variable<String>(status);
    map['created_at'] = Variable<String>(createdAt);
    return map;
  }

  SubscriptionOccurrencesCompanion toCompanion(bool nullToAbsent) {
    return SubscriptionOccurrencesCompanion(
      id: Value(id),
      subscriptionId: Value(subscriptionId),
      dueDate: Value(dueDate),
      amount: Value(amount),
      currency: Value(currency),
      status: Value(status),
      createdAt: Value(createdAt),
    );
  }

  factory SubscriptionOccurrenceRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SubscriptionOccurrenceRow(
      id: serializer.fromJson<String>(json['id']),
      subscriptionId: serializer.fromJson<String>(json['subscriptionId']),
      dueDate: serializer.fromJson<String>(json['dueDate']),
      amount: serializer.fromJson<String>(json['amount']),
      currency: serializer.fromJson<String>(json['currency']),
      status: serializer.fromJson<String>(json['status']),
      createdAt: serializer.fromJson<String>(json['createdAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'subscriptionId': serializer.toJson<String>(subscriptionId),
      'dueDate': serializer.toJson<String>(dueDate),
      'amount': serializer.toJson<String>(amount),
      'currency': serializer.toJson<String>(currency),
      'status': serializer.toJson<String>(status),
      'createdAt': serializer.toJson<String>(createdAt),
    };
  }

  SubscriptionOccurrenceRow copyWith({
    String? id,
    String? subscriptionId,
    String? dueDate,
    String? amount,
    String? currency,
    String? status,
    String? createdAt,
  }) => SubscriptionOccurrenceRow(
    id: id ?? this.id,
    subscriptionId: subscriptionId ?? this.subscriptionId,
    dueDate: dueDate ?? this.dueDate,
    amount: amount ?? this.amount,
    currency: currency ?? this.currency,
    status: status ?? this.status,
    createdAt: createdAt ?? this.createdAt,
  );
  SubscriptionOccurrenceRow copyWithCompanion(
    SubscriptionOccurrencesCompanion data,
  ) {
    return SubscriptionOccurrenceRow(
      id: data.id.present ? data.id.value : this.id,
      subscriptionId: data.subscriptionId.present
          ? data.subscriptionId.value
          : this.subscriptionId,
      dueDate: data.dueDate.present ? data.dueDate.value : this.dueDate,
      amount: data.amount.present ? data.amount.value : this.amount,
      currency: data.currency.present ? data.currency.value : this.currency,
      status: data.status.present ? data.status.value : this.status,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SubscriptionOccurrenceRow(')
          ..write('id: $id, ')
          ..write('subscriptionId: $subscriptionId, ')
          ..write('dueDate: $dueDate, ')
          ..write('amount: $amount, ')
          ..write('currency: $currency, ')
          ..write('status: $status, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    subscriptionId,
    dueDate,
    amount,
    currency,
    status,
    createdAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SubscriptionOccurrenceRow &&
          other.id == this.id &&
          other.subscriptionId == this.subscriptionId &&
          other.dueDate == this.dueDate &&
          other.amount == this.amount &&
          other.currency == this.currency &&
          other.status == this.status &&
          other.createdAt == this.createdAt);
}

class SubscriptionOccurrencesCompanion
    extends UpdateCompanion<SubscriptionOccurrenceRow> {
  final Value<String> id;
  final Value<String> subscriptionId;
  final Value<String> dueDate;
  final Value<String> amount;
  final Value<String> currency;
  final Value<String> status;
  final Value<String> createdAt;
  final Value<int> rowid;
  const SubscriptionOccurrencesCompanion({
    this.id = const Value.absent(),
    this.subscriptionId = const Value.absent(),
    this.dueDate = const Value.absent(),
    this.amount = const Value.absent(),
    this.currency = const Value.absent(),
    this.status = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SubscriptionOccurrencesCompanion.insert({
    required String id,
    required String subscriptionId,
    required String dueDate,
    required String amount,
    required String currency,
    required String status,
    required String createdAt,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       subscriptionId = Value(subscriptionId),
       dueDate = Value(dueDate),
       amount = Value(amount),
       currency = Value(currency),
       status = Value(status),
       createdAt = Value(createdAt);
  static Insertable<SubscriptionOccurrenceRow> custom({
    Expression<String>? id,
    Expression<String>? subscriptionId,
    Expression<String>? dueDate,
    Expression<String>? amount,
    Expression<String>? currency,
    Expression<String>? status,
    Expression<String>? createdAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (subscriptionId != null) 'subscription_id': subscriptionId,
      if (dueDate != null) 'due_date': dueDate,
      if (amount != null) 'amount': amount,
      if (currency != null) 'currency': currency,
      if (status != null) 'status': status,
      if (createdAt != null) 'created_at': createdAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SubscriptionOccurrencesCompanion copyWith({
    Value<String>? id,
    Value<String>? subscriptionId,
    Value<String>? dueDate,
    Value<String>? amount,
    Value<String>? currency,
    Value<String>? status,
    Value<String>? createdAt,
    Value<int>? rowid,
  }) {
    return SubscriptionOccurrencesCompanion(
      id: id ?? this.id,
      subscriptionId: subscriptionId ?? this.subscriptionId,
      dueDate: dueDate ?? this.dueDate,
      amount: amount ?? this.amount,
      currency: currency ?? this.currency,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (subscriptionId.present) {
      map['subscription_id'] = Variable<String>(subscriptionId.value);
    }
    if (dueDate.present) {
      map['due_date'] = Variable<String>(dueDate.value);
    }
    if (amount.present) {
      map['amount'] = Variable<String>(amount.value);
    }
    if (currency.present) {
      map['currency'] = Variable<String>(currency.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<String>(createdAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SubscriptionOccurrencesCompanion(')
          ..write('id: $id, ')
          ..write('subscriptionId: $subscriptionId, ')
          ..write('dueDate: $dueDate, ')
          ..write('amount: $amount, ')
          ..write('currency: $currency, ')
          ..write('status: $status, ')
          ..write('createdAt: $createdAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LoansTable extends Loans with TableInfo<$LoansTable, LoanRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LoansTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _lenderMeta = const VerificationMeta('lender');
  @override
  late final GeneratedColumn<String> lender = GeneratedColumn<String>(
    'lender',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _currencyMeta = const VerificationMeta(
    'currency',
  );
  @override
  late final GeneratedColumn<String> currency = GeneratedColumn<String>(
    'currency',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _principalAmountMeta = const VerificationMeta(
    'principalAmount',
  );
  @override
  late final GeneratedColumn<String> principalAmount = GeneratedColumn<String>(
    'principal_amount',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _currentPrincipalEstimateMeta =
      const VerificationMeta('currentPrincipalEstimate');
  @override
  late final GeneratedColumn<String> currentPrincipalEstimate =
      GeneratedColumn<String>(
        'current_principal_estimate',
        aliasedName,
        true,
        type: DriftSqlType.string,
        requiredDuringInsert: false,
      );
  static const VerificationMeta _annualRateBpsMeta = const VerificationMeta(
    'annualRateBps',
  );
  @override
  late final GeneratedColumn<int> annualRateBps = GeneratedColumn<int>(
    'annual_rate_bps',
    aliasedName,
    true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _repaymentMethodMeta = const VerificationMeta(
    'repaymentMethod',
  );
  @override
  late final GeneratedColumn<String> repaymentMethod = GeneratedColumn<String>(
    'repayment_method',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _paymentAmountMeta = const VerificationMeta(
    'paymentAmount',
  );
  @override
  late final GeneratedColumn<String> paymentAmount = GeneratedColumn<String>(
    'payment_amount',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _paymentDayMeta = const VerificationMeta(
    'paymentDay',
  );
  @override
  late final GeneratedColumn<int> paymentDay = GeneratedColumn<int>(
    'payment_day',
    aliasedName,
    true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _startDateMeta = const VerificationMeta(
    'startDate',
  );
  @override
  late final GeneratedColumn<String> startDate = GeneratedColumn<String>(
    'start_date',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _termMonthsMeta = const VerificationMeta(
    'termMonths',
  );
  @override
  late final GeneratedColumn<int> termMonths = GeneratedColumn<int>(
    'term_months',
    aliasedName,
    true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
    'status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _noteMeta = const VerificationMeta('note');
  @override
  late final GeneratedColumn<String> note = GeneratedColumn<String>(
    'note',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<String> createdAt = GeneratedColumn<String>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<String> updatedAt = GeneratedColumn<String>(
    'updated_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    name,
    lender,
    currency,
    principalAmount,
    currentPrincipalEstimate,
    annualRateBps,
    repaymentMethod,
    paymentAmount,
    paymentDay,
    startDate,
    termMonths,
    status,
    note,
    createdAt,
    updatedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'loans';
  @override
  VerificationContext validateIntegrity(
    Insertable<LoanRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('lender')) {
      context.handle(
        _lenderMeta,
        lender.isAcceptableOrUnknown(data['lender']!, _lenderMeta),
      );
    }
    if (data.containsKey('currency')) {
      context.handle(
        _currencyMeta,
        currency.isAcceptableOrUnknown(data['currency']!, _currencyMeta),
      );
    } else if (isInserting) {
      context.missing(_currencyMeta);
    }
    if (data.containsKey('principal_amount')) {
      context.handle(
        _principalAmountMeta,
        principalAmount.isAcceptableOrUnknown(
          data['principal_amount']!,
          _principalAmountMeta,
        ),
      );
    }
    if (data.containsKey('current_principal_estimate')) {
      context.handle(
        _currentPrincipalEstimateMeta,
        currentPrincipalEstimate.isAcceptableOrUnknown(
          data['current_principal_estimate']!,
          _currentPrincipalEstimateMeta,
        ),
      );
    }
    if (data.containsKey('annual_rate_bps')) {
      context.handle(
        _annualRateBpsMeta,
        annualRateBps.isAcceptableOrUnknown(
          data['annual_rate_bps']!,
          _annualRateBpsMeta,
        ),
      );
    }
    if (data.containsKey('repayment_method')) {
      context.handle(
        _repaymentMethodMeta,
        repaymentMethod.isAcceptableOrUnknown(
          data['repayment_method']!,
          _repaymentMethodMeta,
        ),
      );
    }
    if (data.containsKey('payment_amount')) {
      context.handle(
        _paymentAmountMeta,
        paymentAmount.isAcceptableOrUnknown(
          data['payment_amount']!,
          _paymentAmountMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_paymentAmountMeta);
    }
    if (data.containsKey('payment_day')) {
      context.handle(
        _paymentDayMeta,
        paymentDay.isAcceptableOrUnknown(data['payment_day']!, _paymentDayMeta),
      );
    }
    if (data.containsKey('start_date')) {
      context.handle(
        _startDateMeta,
        startDate.isAcceptableOrUnknown(data['start_date']!, _startDateMeta),
      );
    } else if (isInserting) {
      context.missing(_startDateMeta);
    }
    if (data.containsKey('term_months')) {
      context.handle(
        _termMonthsMeta,
        termMonths.isAcceptableOrUnknown(data['term_months']!, _termMonthsMeta),
      );
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('note')) {
      context.handle(
        _noteMeta,
        note.isAcceptableOrUnknown(data['note']!, _noteMeta),
      );
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LoanRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LoanRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      lender: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}lender'],
      ),
      currency: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}currency'],
      )!,
      principalAmount: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}principal_amount'],
      ),
      currentPrincipalEstimate: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}current_principal_estimate'],
      ),
      annualRateBps: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}annual_rate_bps'],
      ),
      repaymentMethod: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}repayment_method'],
      ),
      paymentAmount: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}payment_amount'],
      )!,
      paymentDay: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}payment_day'],
      ),
      startDate: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}start_date'],
      )!,
      termMonths: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}term_months'],
      ),
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
      note: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}note'],
      ),
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}created_at'],
      )!,
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}updated_at'],
      )!,
    );
  }

  @override
  $LoansTable createAlias(String alias) {
    return $LoansTable(attachedDatabase, alias);
  }
}

class LoanRow extends DataClass implements Insertable<LoanRow> {
  final String id;
  final String name;
  final String? lender;
  final String currency;
  final String? principalAmount;
  final String? currentPrincipalEstimate;
  final int? annualRateBps;
  final String? repaymentMethod;
  final String paymentAmount;
  final int? paymentDay;
  final String startDate;
  final int? termMonths;
  final String status;
  final String? note;
  final String createdAt;
  final String updatedAt;
  const LoanRow({
    required this.id,
    required this.name,
    this.lender,
    required this.currency,
    this.principalAmount,
    this.currentPrincipalEstimate,
    this.annualRateBps,
    this.repaymentMethod,
    required this.paymentAmount,
    this.paymentDay,
    required this.startDate,
    this.termMonths,
    required this.status,
    this.note,
    required this.createdAt,
    required this.updatedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['name'] = Variable<String>(name);
    if (!nullToAbsent || lender != null) {
      map['lender'] = Variable<String>(lender);
    }
    map['currency'] = Variable<String>(currency);
    if (!nullToAbsent || principalAmount != null) {
      map['principal_amount'] = Variable<String>(principalAmount);
    }
    if (!nullToAbsent || currentPrincipalEstimate != null) {
      map['current_principal_estimate'] = Variable<String>(
        currentPrincipalEstimate,
      );
    }
    if (!nullToAbsent || annualRateBps != null) {
      map['annual_rate_bps'] = Variable<int>(annualRateBps);
    }
    if (!nullToAbsent || repaymentMethod != null) {
      map['repayment_method'] = Variable<String>(repaymentMethod);
    }
    map['payment_amount'] = Variable<String>(paymentAmount);
    if (!nullToAbsent || paymentDay != null) {
      map['payment_day'] = Variable<int>(paymentDay);
    }
    map['start_date'] = Variable<String>(startDate);
    if (!nullToAbsent || termMonths != null) {
      map['term_months'] = Variable<int>(termMonths);
    }
    map['status'] = Variable<String>(status);
    if (!nullToAbsent || note != null) {
      map['note'] = Variable<String>(note);
    }
    map['created_at'] = Variable<String>(createdAt);
    map['updated_at'] = Variable<String>(updatedAt);
    return map;
  }

  LoansCompanion toCompanion(bool nullToAbsent) {
    return LoansCompanion(
      id: Value(id),
      name: Value(name),
      lender: lender == null && nullToAbsent
          ? const Value.absent()
          : Value(lender),
      currency: Value(currency),
      principalAmount: principalAmount == null && nullToAbsent
          ? const Value.absent()
          : Value(principalAmount),
      currentPrincipalEstimate: currentPrincipalEstimate == null && nullToAbsent
          ? const Value.absent()
          : Value(currentPrincipalEstimate),
      annualRateBps: annualRateBps == null && nullToAbsent
          ? const Value.absent()
          : Value(annualRateBps),
      repaymentMethod: repaymentMethod == null && nullToAbsent
          ? const Value.absent()
          : Value(repaymentMethod),
      paymentAmount: Value(paymentAmount),
      paymentDay: paymentDay == null && nullToAbsent
          ? const Value.absent()
          : Value(paymentDay),
      startDate: Value(startDate),
      termMonths: termMonths == null && nullToAbsent
          ? const Value.absent()
          : Value(termMonths),
      status: Value(status),
      note: note == null && nullToAbsent ? const Value.absent() : Value(note),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
    );
  }

  factory LoanRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LoanRow(
      id: serializer.fromJson<String>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      lender: serializer.fromJson<String?>(json['lender']),
      currency: serializer.fromJson<String>(json['currency']),
      principalAmount: serializer.fromJson<String?>(json['principalAmount']),
      currentPrincipalEstimate: serializer.fromJson<String?>(
        json['currentPrincipalEstimate'],
      ),
      annualRateBps: serializer.fromJson<int?>(json['annualRateBps']),
      repaymentMethod: serializer.fromJson<String?>(json['repaymentMethod']),
      paymentAmount: serializer.fromJson<String>(json['paymentAmount']),
      paymentDay: serializer.fromJson<int?>(json['paymentDay']),
      startDate: serializer.fromJson<String>(json['startDate']),
      termMonths: serializer.fromJson<int?>(json['termMonths']),
      status: serializer.fromJson<String>(json['status']),
      note: serializer.fromJson<String?>(json['note']),
      createdAt: serializer.fromJson<String>(json['createdAt']),
      updatedAt: serializer.fromJson<String>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'name': serializer.toJson<String>(name),
      'lender': serializer.toJson<String?>(lender),
      'currency': serializer.toJson<String>(currency),
      'principalAmount': serializer.toJson<String?>(principalAmount),
      'currentPrincipalEstimate': serializer.toJson<String?>(
        currentPrincipalEstimate,
      ),
      'annualRateBps': serializer.toJson<int?>(annualRateBps),
      'repaymentMethod': serializer.toJson<String?>(repaymentMethod),
      'paymentAmount': serializer.toJson<String>(paymentAmount),
      'paymentDay': serializer.toJson<int?>(paymentDay),
      'startDate': serializer.toJson<String>(startDate),
      'termMonths': serializer.toJson<int?>(termMonths),
      'status': serializer.toJson<String>(status),
      'note': serializer.toJson<String?>(note),
      'createdAt': serializer.toJson<String>(createdAt),
      'updatedAt': serializer.toJson<String>(updatedAt),
    };
  }

  LoanRow copyWith({
    String? id,
    String? name,
    Value<String?> lender = const Value.absent(),
    String? currency,
    Value<String?> principalAmount = const Value.absent(),
    Value<String?> currentPrincipalEstimate = const Value.absent(),
    Value<int?> annualRateBps = const Value.absent(),
    Value<String?> repaymentMethod = const Value.absent(),
    String? paymentAmount,
    Value<int?> paymentDay = const Value.absent(),
    String? startDate,
    Value<int?> termMonths = const Value.absent(),
    String? status,
    Value<String?> note = const Value.absent(),
    String? createdAt,
    String? updatedAt,
  }) => LoanRow(
    id: id ?? this.id,
    name: name ?? this.name,
    lender: lender.present ? lender.value : this.lender,
    currency: currency ?? this.currency,
    principalAmount: principalAmount.present
        ? principalAmount.value
        : this.principalAmount,
    currentPrincipalEstimate: currentPrincipalEstimate.present
        ? currentPrincipalEstimate.value
        : this.currentPrincipalEstimate,
    annualRateBps: annualRateBps.present
        ? annualRateBps.value
        : this.annualRateBps,
    repaymentMethod: repaymentMethod.present
        ? repaymentMethod.value
        : this.repaymentMethod,
    paymentAmount: paymentAmount ?? this.paymentAmount,
    paymentDay: paymentDay.present ? paymentDay.value : this.paymentDay,
    startDate: startDate ?? this.startDate,
    termMonths: termMonths.present ? termMonths.value : this.termMonths,
    status: status ?? this.status,
    note: note.present ? note.value : this.note,
    createdAt: createdAt ?? this.createdAt,
    updatedAt: updatedAt ?? this.updatedAt,
  );
  LoanRow copyWithCompanion(LoansCompanion data) {
    return LoanRow(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      lender: data.lender.present ? data.lender.value : this.lender,
      currency: data.currency.present ? data.currency.value : this.currency,
      principalAmount: data.principalAmount.present
          ? data.principalAmount.value
          : this.principalAmount,
      currentPrincipalEstimate: data.currentPrincipalEstimate.present
          ? data.currentPrincipalEstimate.value
          : this.currentPrincipalEstimate,
      annualRateBps: data.annualRateBps.present
          ? data.annualRateBps.value
          : this.annualRateBps,
      repaymentMethod: data.repaymentMethod.present
          ? data.repaymentMethod.value
          : this.repaymentMethod,
      paymentAmount: data.paymentAmount.present
          ? data.paymentAmount.value
          : this.paymentAmount,
      paymentDay: data.paymentDay.present
          ? data.paymentDay.value
          : this.paymentDay,
      startDate: data.startDate.present ? data.startDate.value : this.startDate,
      termMonths: data.termMonths.present
          ? data.termMonths.value
          : this.termMonths,
      status: data.status.present ? data.status.value : this.status,
      note: data.note.present ? data.note.value : this.note,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LoanRow(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('lender: $lender, ')
          ..write('currency: $currency, ')
          ..write('principalAmount: $principalAmount, ')
          ..write('currentPrincipalEstimate: $currentPrincipalEstimate, ')
          ..write('annualRateBps: $annualRateBps, ')
          ..write('repaymentMethod: $repaymentMethod, ')
          ..write('paymentAmount: $paymentAmount, ')
          ..write('paymentDay: $paymentDay, ')
          ..write('startDate: $startDate, ')
          ..write('termMonths: $termMonths, ')
          ..write('status: $status, ')
          ..write('note: $note, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    name,
    lender,
    currency,
    principalAmount,
    currentPrincipalEstimate,
    annualRateBps,
    repaymentMethod,
    paymentAmount,
    paymentDay,
    startDate,
    termMonths,
    status,
    note,
    createdAt,
    updatedAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LoanRow &&
          other.id == this.id &&
          other.name == this.name &&
          other.lender == this.lender &&
          other.currency == this.currency &&
          other.principalAmount == this.principalAmount &&
          other.currentPrincipalEstimate == this.currentPrincipalEstimate &&
          other.annualRateBps == this.annualRateBps &&
          other.repaymentMethod == this.repaymentMethod &&
          other.paymentAmount == this.paymentAmount &&
          other.paymentDay == this.paymentDay &&
          other.startDate == this.startDate &&
          other.termMonths == this.termMonths &&
          other.status == this.status &&
          other.note == this.note &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class LoansCompanion extends UpdateCompanion<LoanRow> {
  final Value<String> id;
  final Value<String> name;
  final Value<String?> lender;
  final Value<String> currency;
  final Value<String?> principalAmount;
  final Value<String?> currentPrincipalEstimate;
  final Value<int?> annualRateBps;
  final Value<String?> repaymentMethod;
  final Value<String> paymentAmount;
  final Value<int?> paymentDay;
  final Value<String> startDate;
  final Value<int?> termMonths;
  final Value<String> status;
  final Value<String?> note;
  final Value<String> createdAt;
  final Value<String> updatedAt;
  final Value<int> rowid;
  const LoansCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.lender = const Value.absent(),
    this.currency = const Value.absent(),
    this.principalAmount = const Value.absent(),
    this.currentPrincipalEstimate = const Value.absent(),
    this.annualRateBps = const Value.absent(),
    this.repaymentMethod = const Value.absent(),
    this.paymentAmount = const Value.absent(),
    this.paymentDay = const Value.absent(),
    this.startDate = const Value.absent(),
    this.termMonths = const Value.absent(),
    this.status = const Value.absent(),
    this.note = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LoansCompanion.insert({
    required String id,
    required String name,
    this.lender = const Value.absent(),
    required String currency,
    this.principalAmount = const Value.absent(),
    this.currentPrincipalEstimate = const Value.absent(),
    this.annualRateBps = const Value.absent(),
    this.repaymentMethod = const Value.absent(),
    required String paymentAmount,
    this.paymentDay = const Value.absent(),
    required String startDate,
    this.termMonths = const Value.absent(),
    required String status,
    this.note = const Value.absent(),
    required String createdAt,
    required String updatedAt,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       name = Value(name),
       currency = Value(currency),
       paymentAmount = Value(paymentAmount),
       startDate = Value(startDate),
       status = Value(status),
       createdAt = Value(createdAt),
       updatedAt = Value(updatedAt);
  static Insertable<LoanRow> custom({
    Expression<String>? id,
    Expression<String>? name,
    Expression<String>? lender,
    Expression<String>? currency,
    Expression<String>? principalAmount,
    Expression<String>? currentPrincipalEstimate,
    Expression<int>? annualRateBps,
    Expression<String>? repaymentMethod,
    Expression<String>? paymentAmount,
    Expression<int>? paymentDay,
    Expression<String>? startDate,
    Expression<int>? termMonths,
    Expression<String>? status,
    Expression<String>? note,
    Expression<String>? createdAt,
    Expression<String>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (lender != null) 'lender': lender,
      if (currency != null) 'currency': currency,
      if (principalAmount != null) 'principal_amount': principalAmount,
      if (currentPrincipalEstimate != null)
        'current_principal_estimate': currentPrincipalEstimate,
      if (annualRateBps != null) 'annual_rate_bps': annualRateBps,
      if (repaymentMethod != null) 'repayment_method': repaymentMethod,
      if (paymentAmount != null) 'payment_amount': paymentAmount,
      if (paymentDay != null) 'payment_day': paymentDay,
      if (startDate != null) 'start_date': startDate,
      if (termMonths != null) 'term_months': termMonths,
      if (status != null) 'status': status,
      if (note != null) 'note': note,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LoansCompanion copyWith({
    Value<String>? id,
    Value<String>? name,
    Value<String?>? lender,
    Value<String>? currency,
    Value<String?>? principalAmount,
    Value<String?>? currentPrincipalEstimate,
    Value<int?>? annualRateBps,
    Value<String?>? repaymentMethod,
    Value<String>? paymentAmount,
    Value<int?>? paymentDay,
    Value<String>? startDate,
    Value<int?>? termMonths,
    Value<String>? status,
    Value<String?>? note,
    Value<String>? createdAt,
    Value<String>? updatedAt,
    Value<int>? rowid,
  }) {
    return LoansCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      lender: lender ?? this.lender,
      currency: currency ?? this.currency,
      principalAmount: principalAmount ?? this.principalAmount,
      currentPrincipalEstimate:
          currentPrincipalEstimate ?? this.currentPrincipalEstimate,
      annualRateBps: annualRateBps ?? this.annualRateBps,
      repaymentMethod: repaymentMethod ?? this.repaymentMethod,
      paymentAmount: paymentAmount ?? this.paymentAmount,
      paymentDay: paymentDay ?? this.paymentDay,
      startDate: startDate ?? this.startDate,
      termMonths: termMonths ?? this.termMonths,
      status: status ?? this.status,
      note: note ?? this.note,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (lender.present) {
      map['lender'] = Variable<String>(lender.value);
    }
    if (currency.present) {
      map['currency'] = Variable<String>(currency.value);
    }
    if (principalAmount.present) {
      map['principal_amount'] = Variable<String>(principalAmount.value);
    }
    if (currentPrincipalEstimate.present) {
      map['current_principal_estimate'] = Variable<String>(
        currentPrincipalEstimate.value,
      );
    }
    if (annualRateBps.present) {
      map['annual_rate_bps'] = Variable<int>(annualRateBps.value);
    }
    if (repaymentMethod.present) {
      map['repayment_method'] = Variable<String>(repaymentMethod.value);
    }
    if (paymentAmount.present) {
      map['payment_amount'] = Variable<String>(paymentAmount.value);
    }
    if (paymentDay.present) {
      map['payment_day'] = Variable<int>(paymentDay.value);
    }
    if (startDate.present) {
      map['start_date'] = Variable<String>(startDate.value);
    }
    if (termMonths.present) {
      map['term_months'] = Variable<int>(termMonths.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (note.present) {
      map['note'] = Variable<String>(note.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<String>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<String>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LoansCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('lender: $lender, ')
          ..write('currency: $currency, ')
          ..write('principalAmount: $principalAmount, ')
          ..write('currentPrincipalEstimate: $currentPrincipalEstimate, ')
          ..write('annualRateBps: $annualRateBps, ')
          ..write('repaymentMethod: $repaymentMethod, ')
          ..write('paymentAmount: $paymentAmount, ')
          ..write('paymentDay: $paymentDay, ')
          ..write('startDate: $startDate, ')
          ..write('termMonths: $termMonths, ')
          ..write('status: $status, ')
          ..write('note: $note, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LoanPaymentOccurrencesTable extends LoanPaymentOccurrences
    with TableInfo<$LoanPaymentOccurrencesTable, LoanPaymentOccurrenceRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LoanPaymentOccurrencesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _loanIdMeta = const VerificationMeta('loanId');
  @override
  late final GeneratedColumn<String> loanId = GeneratedColumn<String>(
    'loan_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _dueDateMeta = const VerificationMeta(
    'dueDate',
  );
  @override
  late final GeneratedColumn<String> dueDate = GeneratedColumn<String>(
    'due_date',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _paymentAmountMeta = const VerificationMeta(
    'paymentAmount',
  );
  @override
  late final GeneratedColumn<String> paymentAmount = GeneratedColumn<String>(
    'payment_amount',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _remainingPrincipalEstimateMeta =
      const VerificationMeta('remainingPrincipalEstimate');
  @override
  late final GeneratedColumn<String> remainingPrincipalEstimate =
      GeneratedColumn<String>(
        'remaining_principal_estimate',
        aliasedName,
        true,
        type: DriftSqlType.string,
        requiredDuringInsert: false,
      );
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
    'status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<String> createdAt = GeneratedColumn<String>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    loanId,
    dueDate,
    paymentAmount,
    remainingPrincipalEstimate,
    status,
    createdAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'loan_payment_occurrences';
  @override
  VerificationContext validateIntegrity(
    Insertable<LoanPaymentOccurrenceRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('loan_id')) {
      context.handle(
        _loanIdMeta,
        loanId.isAcceptableOrUnknown(data['loan_id']!, _loanIdMeta),
      );
    } else if (isInserting) {
      context.missing(_loanIdMeta);
    }
    if (data.containsKey('due_date')) {
      context.handle(
        _dueDateMeta,
        dueDate.isAcceptableOrUnknown(data['due_date']!, _dueDateMeta),
      );
    } else if (isInserting) {
      context.missing(_dueDateMeta);
    }
    if (data.containsKey('payment_amount')) {
      context.handle(
        _paymentAmountMeta,
        paymentAmount.isAcceptableOrUnknown(
          data['payment_amount']!,
          _paymentAmountMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_paymentAmountMeta);
    }
    if (data.containsKey('remaining_principal_estimate')) {
      context.handle(
        _remainingPrincipalEstimateMeta,
        remainingPrincipalEstimate.isAcceptableOrUnknown(
          data['remaining_principal_estimate']!,
          _remainingPrincipalEstimateMeta,
        ),
      );
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LoanPaymentOccurrenceRow map(
    Map<String, dynamic> data, {
    String? tablePrefix,
  }) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LoanPaymentOccurrenceRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      loanId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}loan_id'],
      )!,
      dueDate: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}due_date'],
      )!,
      paymentAmount: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}payment_amount'],
      )!,
      remainingPrincipalEstimate: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}remaining_principal_estimate'],
      ),
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}created_at'],
      )!,
    );
  }

  @override
  $LoanPaymentOccurrencesTable createAlias(String alias) {
    return $LoanPaymentOccurrencesTable(attachedDatabase, alias);
  }
}

class LoanPaymentOccurrenceRow extends DataClass
    implements Insertable<LoanPaymentOccurrenceRow> {
  final String id;
  final String loanId;
  final String dueDate;
  final String paymentAmount;
  final String? remainingPrincipalEstimate;
  final String status;
  final String createdAt;
  const LoanPaymentOccurrenceRow({
    required this.id,
    required this.loanId,
    required this.dueDate,
    required this.paymentAmount,
    this.remainingPrincipalEstimate,
    required this.status,
    required this.createdAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['loan_id'] = Variable<String>(loanId);
    map['due_date'] = Variable<String>(dueDate);
    map['payment_amount'] = Variable<String>(paymentAmount);
    if (!nullToAbsent || remainingPrincipalEstimate != null) {
      map['remaining_principal_estimate'] = Variable<String>(
        remainingPrincipalEstimate,
      );
    }
    map['status'] = Variable<String>(status);
    map['created_at'] = Variable<String>(createdAt);
    return map;
  }

  LoanPaymentOccurrencesCompanion toCompanion(bool nullToAbsent) {
    return LoanPaymentOccurrencesCompanion(
      id: Value(id),
      loanId: Value(loanId),
      dueDate: Value(dueDate),
      paymentAmount: Value(paymentAmount),
      remainingPrincipalEstimate:
          remainingPrincipalEstimate == null && nullToAbsent
          ? const Value.absent()
          : Value(remainingPrincipalEstimate),
      status: Value(status),
      createdAt: Value(createdAt),
    );
  }

  factory LoanPaymentOccurrenceRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LoanPaymentOccurrenceRow(
      id: serializer.fromJson<String>(json['id']),
      loanId: serializer.fromJson<String>(json['loanId']),
      dueDate: serializer.fromJson<String>(json['dueDate']),
      paymentAmount: serializer.fromJson<String>(json['paymentAmount']),
      remainingPrincipalEstimate: serializer.fromJson<String?>(
        json['remainingPrincipalEstimate'],
      ),
      status: serializer.fromJson<String>(json['status']),
      createdAt: serializer.fromJson<String>(json['createdAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'loanId': serializer.toJson<String>(loanId),
      'dueDate': serializer.toJson<String>(dueDate),
      'paymentAmount': serializer.toJson<String>(paymentAmount),
      'remainingPrincipalEstimate': serializer.toJson<String?>(
        remainingPrincipalEstimate,
      ),
      'status': serializer.toJson<String>(status),
      'createdAt': serializer.toJson<String>(createdAt),
    };
  }

  LoanPaymentOccurrenceRow copyWith({
    String? id,
    String? loanId,
    String? dueDate,
    String? paymentAmount,
    Value<String?> remainingPrincipalEstimate = const Value.absent(),
    String? status,
    String? createdAt,
  }) => LoanPaymentOccurrenceRow(
    id: id ?? this.id,
    loanId: loanId ?? this.loanId,
    dueDate: dueDate ?? this.dueDate,
    paymentAmount: paymentAmount ?? this.paymentAmount,
    remainingPrincipalEstimate: remainingPrincipalEstimate.present
        ? remainingPrincipalEstimate.value
        : this.remainingPrincipalEstimate,
    status: status ?? this.status,
    createdAt: createdAt ?? this.createdAt,
  );
  LoanPaymentOccurrenceRow copyWithCompanion(
    LoanPaymentOccurrencesCompanion data,
  ) {
    return LoanPaymentOccurrenceRow(
      id: data.id.present ? data.id.value : this.id,
      loanId: data.loanId.present ? data.loanId.value : this.loanId,
      dueDate: data.dueDate.present ? data.dueDate.value : this.dueDate,
      paymentAmount: data.paymentAmount.present
          ? data.paymentAmount.value
          : this.paymentAmount,
      remainingPrincipalEstimate: data.remainingPrincipalEstimate.present
          ? data.remainingPrincipalEstimate.value
          : this.remainingPrincipalEstimate,
      status: data.status.present ? data.status.value : this.status,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LoanPaymentOccurrenceRow(')
          ..write('id: $id, ')
          ..write('loanId: $loanId, ')
          ..write('dueDate: $dueDate, ')
          ..write('paymentAmount: $paymentAmount, ')
          ..write('remainingPrincipalEstimate: $remainingPrincipalEstimate, ')
          ..write('status: $status, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    loanId,
    dueDate,
    paymentAmount,
    remainingPrincipalEstimate,
    status,
    createdAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LoanPaymentOccurrenceRow &&
          other.id == this.id &&
          other.loanId == this.loanId &&
          other.dueDate == this.dueDate &&
          other.paymentAmount == this.paymentAmount &&
          other.remainingPrincipalEstimate == this.remainingPrincipalEstimate &&
          other.status == this.status &&
          other.createdAt == this.createdAt);
}

class LoanPaymentOccurrencesCompanion
    extends UpdateCompanion<LoanPaymentOccurrenceRow> {
  final Value<String> id;
  final Value<String> loanId;
  final Value<String> dueDate;
  final Value<String> paymentAmount;
  final Value<String?> remainingPrincipalEstimate;
  final Value<String> status;
  final Value<String> createdAt;
  final Value<int> rowid;
  const LoanPaymentOccurrencesCompanion({
    this.id = const Value.absent(),
    this.loanId = const Value.absent(),
    this.dueDate = const Value.absent(),
    this.paymentAmount = const Value.absent(),
    this.remainingPrincipalEstimate = const Value.absent(),
    this.status = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LoanPaymentOccurrencesCompanion.insert({
    required String id,
    required String loanId,
    required String dueDate,
    required String paymentAmount,
    this.remainingPrincipalEstimate = const Value.absent(),
    required String status,
    required String createdAt,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       loanId = Value(loanId),
       dueDate = Value(dueDate),
       paymentAmount = Value(paymentAmount),
       status = Value(status),
       createdAt = Value(createdAt);
  static Insertable<LoanPaymentOccurrenceRow> custom({
    Expression<String>? id,
    Expression<String>? loanId,
    Expression<String>? dueDate,
    Expression<String>? paymentAmount,
    Expression<String>? remainingPrincipalEstimate,
    Expression<String>? status,
    Expression<String>? createdAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (loanId != null) 'loan_id': loanId,
      if (dueDate != null) 'due_date': dueDate,
      if (paymentAmount != null) 'payment_amount': paymentAmount,
      if (remainingPrincipalEstimate != null)
        'remaining_principal_estimate': remainingPrincipalEstimate,
      if (status != null) 'status': status,
      if (createdAt != null) 'created_at': createdAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LoanPaymentOccurrencesCompanion copyWith({
    Value<String>? id,
    Value<String>? loanId,
    Value<String>? dueDate,
    Value<String>? paymentAmount,
    Value<String?>? remainingPrincipalEstimate,
    Value<String>? status,
    Value<String>? createdAt,
    Value<int>? rowid,
  }) {
    return LoanPaymentOccurrencesCompanion(
      id: id ?? this.id,
      loanId: loanId ?? this.loanId,
      dueDate: dueDate ?? this.dueDate,
      paymentAmount: paymentAmount ?? this.paymentAmount,
      remainingPrincipalEstimate:
          remainingPrincipalEstimate ?? this.remainingPrincipalEstimate,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (loanId.present) {
      map['loan_id'] = Variable<String>(loanId.value);
    }
    if (dueDate.present) {
      map['due_date'] = Variable<String>(dueDate.value);
    }
    if (paymentAmount.present) {
      map['payment_amount'] = Variable<String>(paymentAmount.value);
    }
    if (remainingPrincipalEstimate.present) {
      map['remaining_principal_estimate'] = Variable<String>(
        remainingPrincipalEstimate.value,
      );
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<String>(createdAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LoanPaymentOccurrencesCompanion(')
          ..write('id: $id, ')
          ..write('loanId: $loanId, ')
          ..write('dueDate: $dueDate, ')
          ..write('paymentAmount: $paymentAmount, ')
          ..write('remainingPrincipalEstimate: $remainingPrincipalEstimate, ')
          ..write('status: $status, ')
          ..write('createdAt: $createdAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $BudgetSetsTable extends BudgetSets
    with TableInfo<$BudgetSetsTable, BudgetSetRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $BudgetSetsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
    'status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<String> createdAt = GeneratedColumn<String>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<String> updatedAt = GeneratedColumn<String>(
    'updated_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    name,
    status,
    createdAt,
    updatedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'budget_sets';
  @override
  VerificationContext validateIntegrity(
    Insertable<BudgetSetRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  BudgetSetRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return BudgetSetRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}created_at'],
      )!,
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}updated_at'],
      )!,
    );
  }

  @override
  $BudgetSetsTable createAlias(String alias) {
    return $BudgetSetsTable(attachedDatabase, alias);
  }
}

class BudgetSetRow extends DataClass implements Insertable<BudgetSetRow> {
  final String id;
  final String name;
  final String status;
  final String createdAt;
  final String updatedAt;
  const BudgetSetRow({
    required this.id,
    required this.name,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['name'] = Variable<String>(name);
    map['status'] = Variable<String>(status);
    map['created_at'] = Variable<String>(createdAt);
    map['updated_at'] = Variable<String>(updatedAt);
    return map;
  }

  BudgetSetsCompanion toCompanion(bool nullToAbsent) {
    return BudgetSetsCompanion(
      id: Value(id),
      name: Value(name),
      status: Value(status),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
    );
  }

  factory BudgetSetRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return BudgetSetRow(
      id: serializer.fromJson<String>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      status: serializer.fromJson<String>(json['status']),
      createdAt: serializer.fromJson<String>(json['createdAt']),
      updatedAt: serializer.fromJson<String>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'name': serializer.toJson<String>(name),
      'status': serializer.toJson<String>(status),
      'createdAt': serializer.toJson<String>(createdAt),
      'updatedAt': serializer.toJson<String>(updatedAt),
    };
  }

  BudgetSetRow copyWith({
    String? id,
    String? name,
    String? status,
    String? createdAt,
    String? updatedAt,
  }) => BudgetSetRow(
    id: id ?? this.id,
    name: name ?? this.name,
    status: status ?? this.status,
    createdAt: createdAt ?? this.createdAt,
    updatedAt: updatedAt ?? this.updatedAt,
  );
  BudgetSetRow copyWithCompanion(BudgetSetsCompanion data) {
    return BudgetSetRow(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      status: data.status.present ? data.status.value : this.status,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('BudgetSetRow(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('status: $status, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, name, status, createdAt, updatedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is BudgetSetRow &&
          other.id == this.id &&
          other.name == this.name &&
          other.status == this.status &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class BudgetSetsCompanion extends UpdateCompanion<BudgetSetRow> {
  final Value<String> id;
  final Value<String> name;
  final Value<String> status;
  final Value<String> createdAt;
  final Value<String> updatedAt;
  final Value<int> rowid;
  const BudgetSetsCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.status = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  BudgetSetsCompanion.insert({
    required String id,
    required String name,
    required String status,
    required String createdAt,
    required String updatedAt,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       name = Value(name),
       status = Value(status),
       createdAt = Value(createdAt),
       updatedAt = Value(updatedAt);
  static Insertable<BudgetSetRow> custom({
    Expression<String>? id,
    Expression<String>? name,
    Expression<String>? status,
    Expression<String>? createdAt,
    Expression<String>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (status != null) 'status': status,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  BudgetSetsCompanion copyWith({
    Value<String>? id,
    Value<String>? name,
    Value<String>? status,
    Value<String>? createdAt,
    Value<String>? updatedAt,
    Value<int>? rowid,
  }) {
    return BudgetSetsCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<String>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<String>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('BudgetSetsCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('status: $status, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $BudgetPeriodsTable extends BudgetPeriods
    with TableInfo<$BudgetPeriodsTable, BudgetPeriodRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $BudgetPeriodsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _budgetSetIdMeta = const VerificationMeta(
    'budgetSetId',
  );
  @override
  late final GeneratedColumn<String> budgetSetId = GeneratedColumn<String>(
    'budget_set_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _periodKindMeta = const VerificationMeta(
    'periodKind',
  );
  @override
  late final GeneratedColumn<String> periodKind = GeneratedColumn<String>(
    'period_kind',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _periodStartMeta = const VerificationMeta(
    'periodStart',
  );
  @override
  late final GeneratedColumn<String> periodStart = GeneratedColumn<String>(
    'period_start',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _periodEndMeta = const VerificationMeta(
    'periodEnd',
  );
  @override
  late final GeneratedColumn<String> periodEnd = GeneratedColumn<String>(
    'period_end',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _currencyMeta = const VerificationMeta(
    'currency',
  );
  @override
  late final GeneratedColumn<String> currency = GeneratedColumn<String>(
    'currency',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
    'status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    budgetSetId,
    periodKind,
    periodStart,
    periodEnd,
    currency,
    status,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'budget_periods';
  @override
  VerificationContext validateIntegrity(
    Insertable<BudgetPeriodRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('budget_set_id')) {
      context.handle(
        _budgetSetIdMeta,
        budgetSetId.isAcceptableOrUnknown(
          data['budget_set_id']!,
          _budgetSetIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_budgetSetIdMeta);
    }
    if (data.containsKey('period_kind')) {
      context.handle(
        _periodKindMeta,
        periodKind.isAcceptableOrUnknown(data['period_kind']!, _periodKindMeta),
      );
    } else if (isInserting) {
      context.missing(_periodKindMeta);
    }
    if (data.containsKey('period_start')) {
      context.handle(
        _periodStartMeta,
        periodStart.isAcceptableOrUnknown(
          data['period_start']!,
          _periodStartMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_periodStartMeta);
    }
    if (data.containsKey('period_end')) {
      context.handle(
        _periodEndMeta,
        periodEnd.isAcceptableOrUnknown(data['period_end']!, _periodEndMeta),
      );
    } else if (isInserting) {
      context.missing(_periodEndMeta);
    }
    if (data.containsKey('currency')) {
      context.handle(
        _currencyMeta,
        currency.isAcceptableOrUnknown(data['currency']!, _currencyMeta),
      );
    } else if (isInserting) {
      context.missing(_currencyMeta);
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  BudgetPeriodRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return BudgetPeriodRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      budgetSetId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}budget_set_id'],
      )!,
      periodKind: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}period_kind'],
      )!,
      periodStart: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}period_start'],
      )!,
      periodEnd: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}period_end'],
      )!,
      currency: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}currency'],
      )!,
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
    );
  }

  @override
  $BudgetPeriodsTable createAlias(String alias) {
    return $BudgetPeriodsTable(attachedDatabase, alias);
  }
}

class BudgetPeriodRow extends DataClass implements Insertable<BudgetPeriodRow> {
  final String id;
  final String budgetSetId;
  final String periodKind;
  final String periodStart;
  final String periodEnd;
  final String currency;
  final String status;
  const BudgetPeriodRow({
    required this.id,
    required this.budgetSetId,
    required this.periodKind,
    required this.periodStart,
    required this.periodEnd,
    required this.currency,
    required this.status,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['budget_set_id'] = Variable<String>(budgetSetId);
    map['period_kind'] = Variable<String>(periodKind);
    map['period_start'] = Variable<String>(periodStart);
    map['period_end'] = Variable<String>(periodEnd);
    map['currency'] = Variable<String>(currency);
    map['status'] = Variable<String>(status);
    return map;
  }

  BudgetPeriodsCompanion toCompanion(bool nullToAbsent) {
    return BudgetPeriodsCompanion(
      id: Value(id),
      budgetSetId: Value(budgetSetId),
      periodKind: Value(periodKind),
      periodStart: Value(periodStart),
      periodEnd: Value(periodEnd),
      currency: Value(currency),
      status: Value(status),
    );
  }

  factory BudgetPeriodRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return BudgetPeriodRow(
      id: serializer.fromJson<String>(json['id']),
      budgetSetId: serializer.fromJson<String>(json['budgetSetId']),
      periodKind: serializer.fromJson<String>(json['periodKind']),
      periodStart: serializer.fromJson<String>(json['periodStart']),
      periodEnd: serializer.fromJson<String>(json['periodEnd']),
      currency: serializer.fromJson<String>(json['currency']),
      status: serializer.fromJson<String>(json['status']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'budgetSetId': serializer.toJson<String>(budgetSetId),
      'periodKind': serializer.toJson<String>(periodKind),
      'periodStart': serializer.toJson<String>(periodStart),
      'periodEnd': serializer.toJson<String>(periodEnd),
      'currency': serializer.toJson<String>(currency),
      'status': serializer.toJson<String>(status),
    };
  }

  BudgetPeriodRow copyWith({
    String? id,
    String? budgetSetId,
    String? periodKind,
    String? periodStart,
    String? periodEnd,
    String? currency,
    String? status,
  }) => BudgetPeriodRow(
    id: id ?? this.id,
    budgetSetId: budgetSetId ?? this.budgetSetId,
    periodKind: periodKind ?? this.periodKind,
    periodStart: periodStart ?? this.periodStart,
    periodEnd: periodEnd ?? this.periodEnd,
    currency: currency ?? this.currency,
    status: status ?? this.status,
  );
  BudgetPeriodRow copyWithCompanion(BudgetPeriodsCompanion data) {
    return BudgetPeriodRow(
      id: data.id.present ? data.id.value : this.id,
      budgetSetId: data.budgetSetId.present
          ? data.budgetSetId.value
          : this.budgetSetId,
      periodKind: data.periodKind.present
          ? data.periodKind.value
          : this.periodKind,
      periodStart: data.periodStart.present
          ? data.periodStart.value
          : this.periodStart,
      periodEnd: data.periodEnd.present ? data.periodEnd.value : this.periodEnd,
      currency: data.currency.present ? data.currency.value : this.currency,
      status: data.status.present ? data.status.value : this.status,
    );
  }

  @override
  String toString() {
    return (StringBuffer('BudgetPeriodRow(')
          ..write('id: $id, ')
          ..write('budgetSetId: $budgetSetId, ')
          ..write('periodKind: $periodKind, ')
          ..write('periodStart: $periodStart, ')
          ..write('periodEnd: $periodEnd, ')
          ..write('currency: $currency, ')
          ..write('status: $status')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    budgetSetId,
    periodKind,
    periodStart,
    periodEnd,
    currency,
    status,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is BudgetPeriodRow &&
          other.id == this.id &&
          other.budgetSetId == this.budgetSetId &&
          other.periodKind == this.periodKind &&
          other.periodStart == this.periodStart &&
          other.periodEnd == this.periodEnd &&
          other.currency == this.currency &&
          other.status == this.status);
}

class BudgetPeriodsCompanion extends UpdateCompanion<BudgetPeriodRow> {
  final Value<String> id;
  final Value<String> budgetSetId;
  final Value<String> periodKind;
  final Value<String> periodStart;
  final Value<String> periodEnd;
  final Value<String> currency;
  final Value<String> status;
  final Value<int> rowid;
  const BudgetPeriodsCompanion({
    this.id = const Value.absent(),
    this.budgetSetId = const Value.absent(),
    this.periodKind = const Value.absent(),
    this.periodStart = const Value.absent(),
    this.periodEnd = const Value.absent(),
    this.currency = const Value.absent(),
    this.status = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  BudgetPeriodsCompanion.insert({
    required String id,
    required String budgetSetId,
    required String periodKind,
    required String periodStart,
    required String periodEnd,
    required String currency,
    required String status,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       budgetSetId = Value(budgetSetId),
       periodKind = Value(periodKind),
       periodStart = Value(periodStart),
       periodEnd = Value(periodEnd),
       currency = Value(currency),
       status = Value(status);
  static Insertable<BudgetPeriodRow> custom({
    Expression<String>? id,
    Expression<String>? budgetSetId,
    Expression<String>? periodKind,
    Expression<String>? periodStart,
    Expression<String>? periodEnd,
    Expression<String>? currency,
    Expression<String>? status,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (budgetSetId != null) 'budget_set_id': budgetSetId,
      if (periodKind != null) 'period_kind': periodKind,
      if (periodStart != null) 'period_start': periodStart,
      if (periodEnd != null) 'period_end': periodEnd,
      if (currency != null) 'currency': currency,
      if (status != null) 'status': status,
      if (rowid != null) 'rowid': rowid,
    });
  }

  BudgetPeriodsCompanion copyWith({
    Value<String>? id,
    Value<String>? budgetSetId,
    Value<String>? periodKind,
    Value<String>? periodStart,
    Value<String>? periodEnd,
    Value<String>? currency,
    Value<String>? status,
    Value<int>? rowid,
  }) {
    return BudgetPeriodsCompanion(
      id: id ?? this.id,
      budgetSetId: budgetSetId ?? this.budgetSetId,
      periodKind: periodKind ?? this.periodKind,
      periodStart: periodStart ?? this.periodStart,
      periodEnd: periodEnd ?? this.periodEnd,
      currency: currency ?? this.currency,
      status: status ?? this.status,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (budgetSetId.present) {
      map['budget_set_id'] = Variable<String>(budgetSetId.value);
    }
    if (periodKind.present) {
      map['period_kind'] = Variable<String>(periodKind.value);
    }
    if (periodStart.present) {
      map['period_start'] = Variable<String>(periodStart.value);
    }
    if (periodEnd.present) {
      map['period_end'] = Variable<String>(periodEnd.value);
    }
    if (currency.present) {
      map['currency'] = Variable<String>(currency.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('BudgetPeriodsCompanion(')
          ..write('id: $id, ')
          ..write('budgetSetId: $budgetSetId, ')
          ..write('periodKind: $periodKind, ')
          ..write('periodStart: $periodStart, ')
          ..write('periodEnd: $periodEnd, ')
          ..write('currency: $currency, ')
          ..write('status: $status, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $BudgetItemsTable extends BudgetItems
    with TableInfo<$BudgetItemsTable, BudgetItemRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $BudgetItemsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _budgetPeriodIdMeta = const VerificationMeta(
    'budgetPeriodId',
  );
  @override
  late final GeneratedColumn<String> budgetPeriodId = GeneratedColumn<String>(
    'budget_period_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _itemKindMeta = const VerificationMeta(
    'itemKind',
  );
  @override
  late final GeneratedColumn<String> itemKind = GeneratedColumn<String>(
    'item_kind',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _plannedAmountMeta = const VerificationMeta(
    'plannedAmount',
  );
  @override
  late final GeneratedColumn<String> plannedAmount = GeneratedColumn<String>(
    'planned_amount',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _currencyMeta = const VerificationMeta(
    'currency',
  );
  @override
  late final GeneratedColumn<String> currency = GeneratedColumn<String>(
    'currency',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _categoryIdMeta = const VerificationMeta(
    'categoryId',
  );
  @override
  late final GeneratedColumn<String> categoryId = GeneratedColumn<String>(
    'category_id',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
    'status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _noteMeta = const VerificationMeta('note');
  @override
  late final GeneratedColumn<String> note = GeneratedColumn<String>(
    'note',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _colorMeta = const VerificationMeta('color');
  @override
  late final GeneratedColumn<String> color = GeneratedColumn<String>(
    'color',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    budgetPeriodId,
    name,
    itemKind,
    plannedAmount,
    currency,
    categoryId,
    status,
    note,
    color,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'budget_items';
  @override
  VerificationContext validateIntegrity(
    Insertable<BudgetItemRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('budget_period_id')) {
      context.handle(
        _budgetPeriodIdMeta,
        budgetPeriodId.isAcceptableOrUnknown(
          data['budget_period_id']!,
          _budgetPeriodIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_budgetPeriodIdMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('item_kind')) {
      context.handle(
        _itemKindMeta,
        itemKind.isAcceptableOrUnknown(data['item_kind']!, _itemKindMeta),
      );
    } else if (isInserting) {
      context.missing(_itemKindMeta);
    }
    if (data.containsKey('planned_amount')) {
      context.handle(
        _plannedAmountMeta,
        plannedAmount.isAcceptableOrUnknown(
          data['planned_amount']!,
          _plannedAmountMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_plannedAmountMeta);
    }
    if (data.containsKey('currency')) {
      context.handle(
        _currencyMeta,
        currency.isAcceptableOrUnknown(data['currency']!, _currencyMeta),
      );
    } else if (isInserting) {
      context.missing(_currencyMeta);
    }
    if (data.containsKey('category_id')) {
      context.handle(
        _categoryIdMeta,
        categoryId.isAcceptableOrUnknown(data['category_id']!, _categoryIdMeta),
      );
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('note')) {
      context.handle(
        _noteMeta,
        note.isAcceptableOrUnknown(data['note']!, _noteMeta),
      );
    }
    if (data.containsKey('color')) {
      context.handle(
        _colorMeta,
        color.isAcceptableOrUnknown(data['color']!, _colorMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  BudgetItemRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return BudgetItemRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      budgetPeriodId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}budget_period_id'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      itemKind: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}item_kind'],
      )!,
      plannedAmount: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}planned_amount'],
      )!,
      currency: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}currency'],
      )!,
      categoryId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}category_id'],
      ),
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
      note: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}note'],
      ),
      color: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}color'],
      ),
    );
  }

  @override
  $BudgetItemsTable createAlias(String alias) {
    return $BudgetItemsTable(attachedDatabase, alias);
  }
}

class BudgetItemRow extends DataClass implements Insertable<BudgetItemRow> {
  final String id;
  final String budgetPeriodId;
  final String name;
  final String itemKind;
  final String plannedAmount;
  final String currency;
  final String? categoryId;
  final String status;
  final String? note;
  final String? color;
  const BudgetItemRow({
    required this.id,
    required this.budgetPeriodId,
    required this.name,
    required this.itemKind,
    required this.plannedAmount,
    required this.currency,
    this.categoryId,
    required this.status,
    this.note,
    this.color,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['budget_period_id'] = Variable<String>(budgetPeriodId);
    map['name'] = Variable<String>(name);
    map['item_kind'] = Variable<String>(itemKind);
    map['planned_amount'] = Variable<String>(plannedAmount);
    map['currency'] = Variable<String>(currency);
    if (!nullToAbsent || categoryId != null) {
      map['category_id'] = Variable<String>(categoryId);
    }
    map['status'] = Variable<String>(status);
    if (!nullToAbsent || note != null) {
      map['note'] = Variable<String>(note);
    }
    if (!nullToAbsent || color != null) {
      map['color'] = Variable<String>(color);
    }
    return map;
  }

  BudgetItemsCompanion toCompanion(bool nullToAbsent) {
    return BudgetItemsCompanion(
      id: Value(id),
      budgetPeriodId: Value(budgetPeriodId),
      name: Value(name),
      itemKind: Value(itemKind),
      plannedAmount: Value(plannedAmount),
      currency: Value(currency),
      categoryId: categoryId == null && nullToAbsent
          ? const Value.absent()
          : Value(categoryId),
      status: Value(status),
      note: note == null && nullToAbsent ? const Value.absent() : Value(note),
      color: color == null && nullToAbsent
          ? const Value.absent()
          : Value(color),
    );
  }

  factory BudgetItemRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return BudgetItemRow(
      id: serializer.fromJson<String>(json['id']),
      budgetPeriodId: serializer.fromJson<String>(json['budgetPeriodId']),
      name: serializer.fromJson<String>(json['name']),
      itemKind: serializer.fromJson<String>(json['itemKind']),
      plannedAmount: serializer.fromJson<String>(json['plannedAmount']),
      currency: serializer.fromJson<String>(json['currency']),
      categoryId: serializer.fromJson<String?>(json['categoryId']),
      status: serializer.fromJson<String>(json['status']),
      note: serializer.fromJson<String?>(json['note']),
      color: serializer.fromJson<String?>(json['color']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'budgetPeriodId': serializer.toJson<String>(budgetPeriodId),
      'name': serializer.toJson<String>(name),
      'itemKind': serializer.toJson<String>(itemKind),
      'plannedAmount': serializer.toJson<String>(plannedAmount),
      'currency': serializer.toJson<String>(currency),
      'categoryId': serializer.toJson<String?>(categoryId),
      'status': serializer.toJson<String>(status),
      'note': serializer.toJson<String?>(note),
      'color': serializer.toJson<String?>(color),
    };
  }

  BudgetItemRow copyWith({
    String? id,
    String? budgetPeriodId,
    String? name,
    String? itemKind,
    String? plannedAmount,
    String? currency,
    Value<String?> categoryId = const Value.absent(),
    String? status,
    Value<String?> note = const Value.absent(),
    Value<String?> color = const Value.absent(),
  }) => BudgetItemRow(
    id: id ?? this.id,
    budgetPeriodId: budgetPeriodId ?? this.budgetPeriodId,
    name: name ?? this.name,
    itemKind: itemKind ?? this.itemKind,
    plannedAmount: plannedAmount ?? this.plannedAmount,
    currency: currency ?? this.currency,
    categoryId: categoryId.present ? categoryId.value : this.categoryId,
    status: status ?? this.status,
    note: note.present ? note.value : this.note,
    color: color.present ? color.value : this.color,
  );
  BudgetItemRow copyWithCompanion(BudgetItemsCompanion data) {
    return BudgetItemRow(
      id: data.id.present ? data.id.value : this.id,
      budgetPeriodId: data.budgetPeriodId.present
          ? data.budgetPeriodId.value
          : this.budgetPeriodId,
      name: data.name.present ? data.name.value : this.name,
      itemKind: data.itemKind.present ? data.itemKind.value : this.itemKind,
      plannedAmount: data.plannedAmount.present
          ? data.plannedAmount.value
          : this.plannedAmount,
      currency: data.currency.present ? data.currency.value : this.currency,
      categoryId: data.categoryId.present
          ? data.categoryId.value
          : this.categoryId,
      status: data.status.present ? data.status.value : this.status,
      note: data.note.present ? data.note.value : this.note,
      color: data.color.present ? data.color.value : this.color,
    );
  }

  @override
  String toString() {
    return (StringBuffer('BudgetItemRow(')
          ..write('id: $id, ')
          ..write('budgetPeriodId: $budgetPeriodId, ')
          ..write('name: $name, ')
          ..write('itemKind: $itemKind, ')
          ..write('plannedAmount: $plannedAmount, ')
          ..write('currency: $currency, ')
          ..write('categoryId: $categoryId, ')
          ..write('status: $status, ')
          ..write('note: $note, ')
          ..write('color: $color')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    budgetPeriodId,
    name,
    itemKind,
    plannedAmount,
    currency,
    categoryId,
    status,
    note,
    color,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is BudgetItemRow &&
          other.id == this.id &&
          other.budgetPeriodId == this.budgetPeriodId &&
          other.name == this.name &&
          other.itemKind == this.itemKind &&
          other.plannedAmount == this.plannedAmount &&
          other.currency == this.currency &&
          other.categoryId == this.categoryId &&
          other.status == this.status &&
          other.note == this.note &&
          other.color == this.color);
}

class BudgetItemsCompanion extends UpdateCompanion<BudgetItemRow> {
  final Value<String> id;
  final Value<String> budgetPeriodId;
  final Value<String> name;
  final Value<String> itemKind;
  final Value<String> plannedAmount;
  final Value<String> currency;
  final Value<String?> categoryId;
  final Value<String> status;
  final Value<String?> note;
  final Value<String?> color;
  final Value<int> rowid;
  const BudgetItemsCompanion({
    this.id = const Value.absent(),
    this.budgetPeriodId = const Value.absent(),
    this.name = const Value.absent(),
    this.itemKind = const Value.absent(),
    this.plannedAmount = const Value.absent(),
    this.currency = const Value.absent(),
    this.categoryId = const Value.absent(),
    this.status = const Value.absent(),
    this.note = const Value.absent(),
    this.color = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  BudgetItemsCompanion.insert({
    required String id,
    required String budgetPeriodId,
    required String name,
    required String itemKind,
    required String plannedAmount,
    required String currency,
    this.categoryId = const Value.absent(),
    required String status,
    this.note = const Value.absent(),
    this.color = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       budgetPeriodId = Value(budgetPeriodId),
       name = Value(name),
       itemKind = Value(itemKind),
       plannedAmount = Value(plannedAmount),
       currency = Value(currency),
       status = Value(status);
  static Insertable<BudgetItemRow> custom({
    Expression<String>? id,
    Expression<String>? budgetPeriodId,
    Expression<String>? name,
    Expression<String>? itemKind,
    Expression<String>? plannedAmount,
    Expression<String>? currency,
    Expression<String>? categoryId,
    Expression<String>? status,
    Expression<String>? note,
    Expression<String>? color,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (budgetPeriodId != null) 'budget_period_id': budgetPeriodId,
      if (name != null) 'name': name,
      if (itemKind != null) 'item_kind': itemKind,
      if (plannedAmount != null) 'planned_amount': plannedAmount,
      if (currency != null) 'currency': currency,
      if (categoryId != null) 'category_id': categoryId,
      if (status != null) 'status': status,
      if (note != null) 'note': note,
      if (color != null) 'color': color,
      if (rowid != null) 'rowid': rowid,
    });
  }

  BudgetItemsCompanion copyWith({
    Value<String>? id,
    Value<String>? budgetPeriodId,
    Value<String>? name,
    Value<String>? itemKind,
    Value<String>? plannedAmount,
    Value<String>? currency,
    Value<String?>? categoryId,
    Value<String>? status,
    Value<String?>? note,
    Value<String?>? color,
    Value<int>? rowid,
  }) {
    return BudgetItemsCompanion(
      id: id ?? this.id,
      budgetPeriodId: budgetPeriodId ?? this.budgetPeriodId,
      name: name ?? this.name,
      itemKind: itemKind ?? this.itemKind,
      plannedAmount: plannedAmount ?? this.plannedAmount,
      currency: currency ?? this.currency,
      categoryId: categoryId ?? this.categoryId,
      status: status ?? this.status,
      note: note ?? this.note,
      color: color ?? this.color,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (budgetPeriodId.present) {
      map['budget_period_id'] = Variable<String>(budgetPeriodId.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (itemKind.present) {
      map['item_kind'] = Variable<String>(itemKind.value);
    }
    if (plannedAmount.present) {
      map['planned_amount'] = Variable<String>(plannedAmount.value);
    }
    if (currency.present) {
      map['currency'] = Variable<String>(currency.value);
    }
    if (categoryId.present) {
      map['category_id'] = Variable<String>(categoryId.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (note.present) {
      map['note'] = Variable<String>(note.value);
    }
    if (color.present) {
      map['color'] = Variable<String>(color.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('BudgetItemsCompanion(')
          ..write('id: $id, ')
          ..write('budgetPeriodId: $budgetPeriodId, ')
          ..write('name: $name, ')
          ..write('itemKind: $itemKind, ')
          ..write('plannedAmount: $plannedAmount, ')
          ..write('currency: $currency, ')
          ..write('categoryId: $categoryId, ')
          ..write('status: $status, ')
          ..write('note: $note, ')
          ..write('color: $color, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $CurrencySettingsTable extends CurrencySettings
    with TableInfo<$CurrencySettingsTable, CurrencySettingRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $CurrencySettingsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _displayCurrencyMeta = const VerificationMeta(
    'displayCurrency',
  );
  @override
  late final GeneratedColumn<String> displayCurrency = GeneratedColumn<String>(
    'display_currency',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<String> updatedAt = GeneratedColumn<String>(
    'updated_at',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [id, displayCurrency, updatedAt];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'currency_settings';
  @override
  VerificationContext validateIntegrity(
    Insertable<CurrencySettingRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('display_currency')) {
      context.handle(
        _displayCurrencyMeta,
        displayCurrency.isAcceptableOrUnknown(
          data['display_currency']!,
          _displayCurrencyMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_displayCurrencyMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  CurrencySettingRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return CurrencySettingRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      displayCurrency: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}display_currency'],
      )!,
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}updated_at'],
      )!,
    );
  }

  @override
  $CurrencySettingsTable createAlias(String alias) {
    return $CurrencySettingsTable(attachedDatabase, alias);
  }
}

class CurrencySettingRow extends DataClass
    implements Insertable<CurrencySettingRow> {
  final String id;
  final String displayCurrency;
  final String updatedAt;
  const CurrencySettingRow({
    required this.id,
    required this.displayCurrency,
    required this.updatedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['display_currency'] = Variable<String>(displayCurrency);
    map['updated_at'] = Variable<String>(updatedAt);
    return map;
  }

  CurrencySettingsCompanion toCompanion(bool nullToAbsent) {
    return CurrencySettingsCompanion(
      id: Value(id),
      displayCurrency: Value(displayCurrency),
      updatedAt: Value(updatedAt),
    );
  }

  factory CurrencySettingRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return CurrencySettingRow(
      id: serializer.fromJson<String>(json['id']),
      displayCurrency: serializer.fromJson<String>(json['displayCurrency']),
      updatedAt: serializer.fromJson<String>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'displayCurrency': serializer.toJson<String>(displayCurrency),
      'updatedAt': serializer.toJson<String>(updatedAt),
    };
  }

  CurrencySettingRow copyWith({
    String? id,
    String? displayCurrency,
    String? updatedAt,
  }) => CurrencySettingRow(
    id: id ?? this.id,
    displayCurrency: displayCurrency ?? this.displayCurrency,
    updatedAt: updatedAt ?? this.updatedAt,
  );
  CurrencySettingRow copyWithCompanion(CurrencySettingsCompanion data) {
    return CurrencySettingRow(
      id: data.id.present ? data.id.value : this.id,
      displayCurrency: data.displayCurrency.present
          ? data.displayCurrency.value
          : this.displayCurrency,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('CurrencySettingRow(')
          ..write('id: $id, ')
          ..write('displayCurrency: $displayCurrency, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, displayCurrency, updatedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is CurrencySettingRow &&
          other.id == this.id &&
          other.displayCurrency == this.displayCurrency &&
          other.updatedAt == this.updatedAt);
}

class CurrencySettingsCompanion extends UpdateCompanion<CurrencySettingRow> {
  final Value<String> id;
  final Value<String> displayCurrency;
  final Value<String> updatedAt;
  final Value<int> rowid;
  const CurrencySettingsCompanion({
    this.id = const Value.absent(),
    this.displayCurrency = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  CurrencySettingsCompanion.insert({
    required String id,
    required String displayCurrency,
    required String updatedAt,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       displayCurrency = Value(displayCurrency),
       updatedAt = Value(updatedAt);
  static Insertable<CurrencySettingRow> custom({
    Expression<String>? id,
    Expression<String>? displayCurrency,
    Expression<String>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (displayCurrency != null) 'display_currency': displayCurrency,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  CurrencySettingsCompanion copyWith({
    Value<String>? id,
    Value<String>? displayCurrency,
    Value<String>? updatedAt,
    Value<int>? rowid,
  }) {
    return CurrencySettingsCompanion(
      id: id ?? this.id,
      displayCurrency: displayCurrency ?? this.displayCurrency,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (displayCurrency.present) {
      map['display_currency'] = Variable<String>(displayCurrency.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<String>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('CurrencySettingsCompanion(')
          ..write('id: $id, ')
          ..write('displayCurrency: $displayCurrency, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $ExchangeRatesTable extends ExchangeRates
    with TableInfo<$ExchangeRatesTable, ExchangeRateRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ExchangeRatesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _fromCurrencyMeta = const VerificationMeta(
    'fromCurrency',
  );
  @override
  late final GeneratedColumn<String> fromCurrency = GeneratedColumn<String>(
    'from_currency',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _toCurrencyMeta = const VerificationMeta(
    'toCurrency',
  );
  @override
  late final GeneratedColumn<String> toCurrency = GeneratedColumn<String>(
    'to_currency',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _rateDateMeta = const VerificationMeta(
    'rateDate',
  );
  @override
  late final GeneratedColumn<String> rateDate = GeneratedColumn<String>(
    'rate_date',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _rateMeta = const VerificationMeta('rate');
  @override
  late final GeneratedColumn<String> rate = GeneratedColumn<String>(
    'rate',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    fromCurrency,
    toCurrency,
    rateDate,
    rate,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'exchange_rates';
  @override
  VerificationContext validateIntegrity(
    Insertable<ExchangeRateRow> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('from_currency')) {
      context.handle(
        _fromCurrencyMeta,
        fromCurrency.isAcceptableOrUnknown(
          data['from_currency']!,
          _fromCurrencyMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_fromCurrencyMeta);
    }
    if (data.containsKey('to_currency')) {
      context.handle(
        _toCurrencyMeta,
        toCurrency.isAcceptableOrUnknown(data['to_currency']!, _toCurrencyMeta),
      );
    } else if (isInserting) {
      context.missing(_toCurrencyMeta);
    }
    if (data.containsKey('rate_date')) {
      context.handle(
        _rateDateMeta,
        rateDate.isAcceptableOrUnknown(data['rate_date']!, _rateDateMeta),
      );
    } else if (isInserting) {
      context.missing(_rateDateMeta);
    }
    if (data.containsKey('rate')) {
      context.handle(
        _rateMeta,
        rate.isAcceptableOrUnknown(data['rate']!, _rateMeta),
      );
    } else if (isInserting) {
      context.missing(_rateMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  ExchangeRateRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return ExchangeRateRow(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      fromCurrency: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}from_currency'],
      )!,
      toCurrency: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}to_currency'],
      )!,
      rateDate: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}rate_date'],
      )!,
      rate: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}rate'],
      )!,
    );
  }

  @override
  $ExchangeRatesTable createAlias(String alias) {
    return $ExchangeRatesTable(attachedDatabase, alias);
  }
}

class ExchangeRateRow extends DataClass implements Insertable<ExchangeRateRow> {
  final String id;
  final String fromCurrency;
  final String toCurrency;
  final String rateDate;
  final String rate;
  const ExchangeRateRow({
    required this.id,
    required this.fromCurrency,
    required this.toCurrency,
    required this.rateDate,
    required this.rate,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['from_currency'] = Variable<String>(fromCurrency);
    map['to_currency'] = Variable<String>(toCurrency);
    map['rate_date'] = Variable<String>(rateDate);
    map['rate'] = Variable<String>(rate);
    return map;
  }

  ExchangeRatesCompanion toCompanion(bool nullToAbsent) {
    return ExchangeRatesCompanion(
      id: Value(id),
      fromCurrency: Value(fromCurrency),
      toCurrency: Value(toCurrency),
      rateDate: Value(rateDate),
      rate: Value(rate),
    );
  }

  factory ExchangeRateRow.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return ExchangeRateRow(
      id: serializer.fromJson<String>(json['id']),
      fromCurrency: serializer.fromJson<String>(json['fromCurrency']),
      toCurrency: serializer.fromJson<String>(json['toCurrency']),
      rateDate: serializer.fromJson<String>(json['rateDate']),
      rate: serializer.fromJson<String>(json['rate']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'fromCurrency': serializer.toJson<String>(fromCurrency),
      'toCurrency': serializer.toJson<String>(toCurrency),
      'rateDate': serializer.toJson<String>(rateDate),
      'rate': serializer.toJson<String>(rate),
    };
  }

  ExchangeRateRow copyWith({
    String? id,
    String? fromCurrency,
    String? toCurrency,
    String? rateDate,
    String? rate,
  }) => ExchangeRateRow(
    id: id ?? this.id,
    fromCurrency: fromCurrency ?? this.fromCurrency,
    toCurrency: toCurrency ?? this.toCurrency,
    rateDate: rateDate ?? this.rateDate,
    rate: rate ?? this.rate,
  );
  ExchangeRateRow copyWithCompanion(ExchangeRatesCompanion data) {
    return ExchangeRateRow(
      id: data.id.present ? data.id.value : this.id,
      fromCurrency: data.fromCurrency.present
          ? data.fromCurrency.value
          : this.fromCurrency,
      toCurrency: data.toCurrency.present
          ? data.toCurrency.value
          : this.toCurrency,
      rateDate: data.rateDate.present ? data.rateDate.value : this.rateDate,
      rate: data.rate.present ? data.rate.value : this.rate,
    );
  }

  @override
  String toString() {
    return (StringBuffer('ExchangeRateRow(')
          ..write('id: $id, ')
          ..write('fromCurrency: $fromCurrency, ')
          ..write('toCurrency: $toCurrency, ')
          ..write('rateDate: $rateDate, ')
          ..write('rate: $rate')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, fromCurrency, toCurrency, rateDate, rate);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is ExchangeRateRow &&
          other.id == this.id &&
          other.fromCurrency == this.fromCurrency &&
          other.toCurrency == this.toCurrency &&
          other.rateDate == this.rateDate &&
          other.rate == this.rate);
}

class ExchangeRatesCompanion extends UpdateCompanion<ExchangeRateRow> {
  final Value<String> id;
  final Value<String> fromCurrency;
  final Value<String> toCurrency;
  final Value<String> rateDate;
  final Value<String> rate;
  final Value<int> rowid;
  const ExchangeRatesCompanion({
    this.id = const Value.absent(),
    this.fromCurrency = const Value.absent(),
    this.toCurrency = const Value.absent(),
    this.rateDate = const Value.absent(),
    this.rate = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  ExchangeRatesCompanion.insert({
    required String id,
    required String fromCurrency,
    required String toCurrency,
    required String rateDate,
    required String rate,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       fromCurrency = Value(fromCurrency),
       toCurrency = Value(toCurrency),
       rateDate = Value(rateDate),
       rate = Value(rate);
  static Insertable<ExchangeRateRow> custom({
    Expression<String>? id,
    Expression<String>? fromCurrency,
    Expression<String>? toCurrency,
    Expression<String>? rateDate,
    Expression<String>? rate,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (fromCurrency != null) 'from_currency': fromCurrency,
      if (toCurrency != null) 'to_currency': toCurrency,
      if (rateDate != null) 'rate_date': rateDate,
      if (rate != null) 'rate': rate,
      if (rowid != null) 'rowid': rowid,
    });
  }

  ExchangeRatesCompanion copyWith({
    Value<String>? id,
    Value<String>? fromCurrency,
    Value<String>? toCurrency,
    Value<String>? rateDate,
    Value<String>? rate,
    Value<int>? rowid,
  }) {
    return ExchangeRatesCompanion(
      id: id ?? this.id,
      fromCurrency: fromCurrency ?? this.fromCurrency,
      toCurrency: toCurrency ?? this.toCurrency,
      rateDate: rateDate ?? this.rateDate,
      rate: rate ?? this.rate,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (fromCurrency.present) {
      map['from_currency'] = Variable<String>(fromCurrency.value);
    }
    if (toCurrency.present) {
      map['to_currency'] = Variable<String>(toCurrency.value);
    }
    if (rateDate.present) {
      map['rate_date'] = Variable<String>(rateDate.value);
    }
    if (rate.present) {
      map['rate'] = Variable<String>(rate.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ExchangeRatesCompanion(')
          ..write('id: $id, ')
          ..write('fromCurrency: $fromCurrency, ')
          ..write('toCurrency: $toCurrency, ')
          ..write('rateDate: $rateDate, ')
          ..write('rate: $rate, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$FlowmDatabase extends GeneratedDatabase {
  _$FlowmDatabase(QueryExecutor e) : super(e);
  $FlowmDatabaseManager get managers => $FlowmDatabaseManager(this);
  late final $CategoriesTable categories = $CategoriesTable(this);
  late final $TagsTable tags = $TagsTable(this);
  late final $CashflowEventsTable cashflowEvents = $CashflowEventsTable(this);
  late final $CashflowEventTagsTable cashflowEventTags =
      $CashflowEventTagsTable(this);
  late final $AssetItemsTable assetItems = $AssetItemsTable(this);
  late final $AssetSnapshotsTable assetSnapshots = $AssetSnapshotsTable(this);
  late final $SubscriptionsTable subscriptions = $SubscriptionsTable(this);
  late final $SubscriptionOccurrencesTable subscriptionOccurrences =
      $SubscriptionOccurrencesTable(this);
  late final $LoansTable loans = $LoansTable(this);
  late final $LoanPaymentOccurrencesTable loanPaymentOccurrences =
      $LoanPaymentOccurrencesTable(this);
  late final $BudgetSetsTable budgetSets = $BudgetSetsTable(this);
  late final $BudgetPeriodsTable budgetPeriods = $BudgetPeriodsTable(this);
  late final $BudgetItemsTable budgetItems = $BudgetItemsTable(this);
  late final $CurrencySettingsTable currencySettings = $CurrencySettingsTable(
    this,
  );
  late final $ExchangeRatesTable exchangeRates = $ExchangeRatesTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
    categories,
    tags,
    cashflowEvents,
    cashflowEventTags,
    assetItems,
    assetSnapshots,
    subscriptions,
    subscriptionOccurrences,
    loans,
    loanPaymentOccurrences,
    budgetSets,
    budgetPeriods,
    budgetItems,
    currencySettings,
    exchangeRates,
  ];
}

typedef $$CategoriesTableCreateCompanionBuilder =
    CategoriesCompanion Function({
      required String id,
      required String name,
      Value<String?> parentId,
      required String categoryKind,
      Value<String?> color,
      Value<String?> icon,
      required int displayOrder,
      Value<String?> archivedAt,
      required String createdAt,
      required String updatedAt,
      Value<int> rowid,
    });
typedef $$CategoriesTableUpdateCompanionBuilder =
    CategoriesCompanion Function({
      Value<String> id,
      Value<String> name,
      Value<String?> parentId,
      Value<String> categoryKind,
      Value<String?> color,
      Value<String?> icon,
      Value<int> displayOrder,
      Value<String?> archivedAt,
      Value<String> createdAt,
      Value<String> updatedAt,
      Value<int> rowid,
    });

class $$CategoriesTableFilterComposer
    extends Composer<_$FlowmDatabase, $CategoriesTable> {
  $$CategoriesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get parentId => $composableBuilder(
    column: $table.parentId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get categoryKind => $composableBuilder(
    column: $table.categoryKind,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get color => $composableBuilder(
    column: $table.color,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get icon => $composableBuilder(
    column: $table.icon,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get displayOrder => $composableBuilder(
    column: $table.displayOrder,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get archivedAt => $composableBuilder(
    column: $table.archivedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$CategoriesTableOrderingComposer
    extends Composer<_$FlowmDatabase, $CategoriesTable> {
  $$CategoriesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get parentId => $composableBuilder(
    column: $table.parentId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get categoryKind => $composableBuilder(
    column: $table.categoryKind,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get color => $composableBuilder(
    column: $table.color,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get icon => $composableBuilder(
    column: $table.icon,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get displayOrder => $composableBuilder(
    column: $table.displayOrder,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get archivedAt => $composableBuilder(
    column: $table.archivedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$CategoriesTableAnnotationComposer
    extends Composer<_$FlowmDatabase, $CategoriesTable> {
  $$CategoriesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get parentId =>
      $composableBuilder(column: $table.parentId, builder: (column) => column);

  GeneratedColumn<String> get categoryKind => $composableBuilder(
    column: $table.categoryKind,
    builder: (column) => column,
  );

  GeneratedColumn<String> get color =>
      $composableBuilder(column: $table.color, builder: (column) => column);

  GeneratedColumn<String> get icon =>
      $composableBuilder(column: $table.icon, builder: (column) => column);

  GeneratedColumn<int> get displayOrder => $composableBuilder(
    column: $table.displayOrder,
    builder: (column) => column,
  );

  GeneratedColumn<String> get archivedAt => $composableBuilder(
    column: $table.archivedAt,
    builder: (column) => column,
  );

  GeneratedColumn<String> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<String> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$CategoriesTableTableManager
    extends
        RootTableManager<
          _$FlowmDatabase,
          $CategoriesTable,
          CategoryRow,
          $$CategoriesTableFilterComposer,
          $$CategoriesTableOrderingComposer,
          $$CategoriesTableAnnotationComposer,
          $$CategoriesTableCreateCompanionBuilder,
          $$CategoriesTableUpdateCompanionBuilder,
          (
            CategoryRow,
            BaseReferences<_$FlowmDatabase, $CategoriesTable, CategoryRow>,
          ),
          CategoryRow,
          PrefetchHooks Function()
        > {
  $$CategoriesTableTableManager(_$FlowmDatabase db, $CategoriesTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$CategoriesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$CategoriesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$CategoriesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<String?> parentId = const Value.absent(),
                Value<String> categoryKind = const Value.absent(),
                Value<String?> color = const Value.absent(),
                Value<String?> icon = const Value.absent(),
                Value<int> displayOrder = const Value.absent(),
                Value<String?> archivedAt = const Value.absent(),
                Value<String> createdAt = const Value.absent(),
                Value<String> updatedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => CategoriesCompanion(
                id: id,
                name: name,
                parentId: parentId,
                categoryKind: categoryKind,
                color: color,
                icon: icon,
                displayOrder: displayOrder,
                archivedAt: archivedAt,
                createdAt: createdAt,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String name,
                Value<String?> parentId = const Value.absent(),
                required String categoryKind,
                Value<String?> color = const Value.absent(),
                Value<String?> icon = const Value.absent(),
                required int displayOrder,
                Value<String?> archivedAt = const Value.absent(),
                required String createdAt,
                required String updatedAt,
                Value<int> rowid = const Value.absent(),
              }) => CategoriesCompanion.insert(
                id: id,
                name: name,
                parentId: parentId,
                categoryKind: categoryKind,
                color: color,
                icon: icon,
                displayOrder: displayOrder,
                archivedAt: archivedAt,
                createdAt: createdAt,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$CategoriesTableProcessedTableManager =
    ProcessedTableManager<
      _$FlowmDatabase,
      $CategoriesTable,
      CategoryRow,
      $$CategoriesTableFilterComposer,
      $$CategoriesTableOrderingComposer,
      $$CategoriesTableAnnotationComposer,
      $$CategoriesTableCreateCompanionBuilder,
      $$CategoriesTableUpdateCompanionBuilder,
      (
        CategoryRow,
        BaseReferences<_$FlowmDatabase, $CategoriesTable, CategoryRow>,
      ),
      CategoryRow,
      PrefetchHooks Function()
    >;
typedef $$TagsTableCreateCompanionBuilder =
    TagsCompanion Function({
      required String id,
      required String name,
      Value<String?> color,
      Value<String?> archivedAt,
      required String createdAt,
      required String updatedAt,
      Value<int> rowid,
    });
typedef $$TagsTableUpdateCompanionBuilder =
    TagsCompanion Function({
      Value<String> id,
      Value<String> name,
      Value<String?> color,
      Value<String?> archivedAt,
      Value<String> createdAt,
      Value<String> updatedAt,
      Value<int> rowid,
    });

class $$TagsTableFilterComposer extends Composer<_$FlowmDatabase, $TagsTable> {
  $$TagsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get color => $composableBuilder(
    column: $table.color,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get archivedAt => $composableBuilder(
    column: $table.archivedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$TagsTableOrderingComposer
    extends Composer<_$FlowmDatabase, $TagsTable> {
  $$TagsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get color => $composableBuilder(
    column: $table.color,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get archivedAt => $composableBuilder(
    column: $table.archivedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$TagsTableAnnotationComposer
    extends Composer<_$FlowmDatabase, $TagsTable> {
  $$TagsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get color =>
      $composableBuilder(column: $table.color, builder: (column) => column);

  GeneratedColumn<String> get archivedAt => $composableBuilder(
    column: $table.archivedAt,
    builder: (column) => column,
  );

  GeneratedColumn<String> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<String> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$TagsTableTableManager
    extends
        RootTableManager<
          _$FlowmDatabase,
          $TagsTable,
          TagRow,
          $$TagsTableFilterComposer,
          $$TagsTableOrderingComposer,
          $$TagsTableAnnotationComposer,
          $$TagsTableCreateCompanionBuilder,
          $$TagsTableUpdateCompanionBuilder,
          (TagRow, BaseReferences<_$FlowmDatabase, $TagsTable, TagRow>),
          TagRow,
          PrefetchHooks Function()
        > {
  $$TagsTableTableManager(_$FlowmDatabase db, $TagsTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$TagsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$TagsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$TagsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<String?> color = const Value.absent(),
                Value<String?> archivedAt = const Value.absent(),
                Value<String> createdAt = const Value.absent(),
                Value<String> updatedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => TagsCompanion(
                id: id,
                name: name,
                color: color,
                archivedAt: archivedAt,
                createdAt: createdAt,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String name,
                Value<String?> color = const Value.absent(),
                Value<String?> archivedAt = const Value.absent(),
                required String createdAt,
                required String updatedAt,
                Value<int> rowid = const Value.absent(),
              }) => TagsCompanion.insert(
                id: id,
                name: name,
                color: color,
                archivedAt: archivedAt,
                createdAt: createdAt,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$TagsTableProcessedTableManager =
    ProcessedTableManager<
      _$FlowmDatabase,
      $TagsTable,
      TagRow,
      $$TagsTableFilterComposer,
      $$TagsTableOrderingComposer,
      $$TagsTableAnnotationComposer,
      $$TagsTableCreateCompanionBuilder,
      $$TagsTableUpdateCompanionBuilder,
      (TagRow, BaseReferences<_$FlowmDatabase, $TagsTable, TagRow>),
      TagRow,
      PrefetchHooks Function()
    >;
typedef $$CashflowEventsTableCreateCompanionBuilder =
    CashflowEventsCompanion Function({
      required String id,
      required String eventDate,
      Value<String?> occurredAt,
      Value<String?> title,
      Value<String?> counterparty,
      Value<String?> description,
      required String amount,
      required String currency,
      required String direction,
      required String flowKind,
      Value<String?> categoryId,
      required String sourceKind,
      Value<String?> sourceName,
      Value<String?> paymentMethod,
      Value<String?> accountHint,
      required bool includeInAnalytics,
      required String status,
      required String createdAt,
      required String updatedAt,
      Value<int> rowid,
    });
typedef $$CashflowEventsTableUpdateCompanionBuilder =
    CashflowEventsCompanion Function({
      Value<String> id,
      Value<String> eventDate,
      Value<String?> occurredAt,
      Value<String?> title,
      Value<String?> counterparty,
      Value<String?> description,
      Value<String> amount,
      Value<String> currency,
      Value<String> direction,
      Value<String> flowKind,
      Value<String?> categoryId,
      Value<String> sourceKind,
      Value<String?> sourceName,
      Value<String?> paymentMethod,
      Value<String?> accountHint,
      Value<bool> includeInAnalytics,
      Value<String> status,
      Value<String> createdAt,
      Value<String> updatedAt,
      Value<int> rowid,
    });

class $$CashflowEventsTableFilterComposer
    extends Composer<_$FlowmDatabase, $CashflowEventsTable> {
  $$CashflowEventsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get eventDate => $composableBuilder(
    column: $table.eventDate,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get occurredAt => $composableBuilder(
    column: $table.occurredAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get title => $composableBuilder(
    column: $table.title,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get counterparty => $composableBuilder(
    column: $table.counterparty,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get amount => $composableBuilder(
    column: $table.amount,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get currency => $composableBuilder(
    column: $table.currency,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get direction => $composableBuilder(
    column: $table.direction,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get flowKind => $composableBuilder(
    column: $table.flowKind,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get categoryId => $composableBuilder(
    column: $table.categoryId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get sourceKind => $composableBuilder(
    column: $table.sourceKind,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get sourceName => $composableBuilder(
    column: $table.sourceName,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get paymentMethod => $composableBuilder(
    column: $table.paymentMethod,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get accountHint => $composableBuilder(
    column: $table.accountHint,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get includeInAnalytics => $composableBuilder(
    column: $table.includeInAnalytics,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$CashflowEventsTableOrderingComposer
    extends Composer<_$FlowmDatabase, $CashflowEventsTable> {
  $$CashflowEventsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get eventDate => $composableBuilder(
    column: $table.eventDate,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get occurredAt => $composableBuilder(
    column: $table.occurredAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get title => $composableBuilder(
    column: $table.title,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get counterparty => $composableBuilder(
    column: $table.counterparty,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get amount => $composableBuilder(
    column: $table.amount,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get currency => $composableBuilder(
    column: $table.currency,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get direction => $composableBuilder(
    column: $table.direction,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get flowKind => $composableBuilder(
    column: $table.flowKind,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get categoryId => $composableBuilder(
    column: $table.categoryId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get sourceKind => $composableBuilder(
    column: $table.sourceKind,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get sourceName => $composableBuilder(
    column: $table.sourceName,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get paymentMethod => $composableBuilder(
    column: $table.paymentMethod,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get accountHint => $composableBuilder(
    column: $table.accountHint,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get includeInAnalytics => $composableBuilder(
    column: $table.includeInAnalytics,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$CashflowEventsTableAnnotationComposer
    extends Composer<_$FlowmDatabase, $CashflowEventsTable> {
  $$CashflowEventsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get eventDate =>
      $composableBuilder(column: $table.eventDate, builder: (column) => column);

  GeneratedColumn<String> get occurredAt => $composableBuilder(
    column: $table.occurredAt,
    builder: (column) => column,
  );

  GeneratedColumn<String> get title =>
      $composableBuilder(column: $table.title, builder: (column) => column);

  GeneratedColumn<String> get counterparty => $composableBuilder(
    column: $table.counterparty,
    builder: (column) => column,
  );

  GeneratedColumn<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => column,
  );

  GeneratedColumn<String> get amount =>
      $composableBuilder(column: $table.amount, builder: (column) => column);

  GeneratedColumn<String> get currency =>
      $composableBuilder(column: $table.currency, builder: (column) => column);

  GeneratedColumn<String> get direction =>
      $composableBuilder(column: $table.direction, builder: (column) => column);

  GeneratedColumn<String> get flowKind =>
      $composableBuilder(column: $table.flowKind, builder: (column) => column);

  GeneratedColumn<String> get categoryId => $composableBuilder(
    column: $table.categoryId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get sourceKind => $composableBuilder(
    column: $table.sourceKind,
    builder: (column) => column,
  );

  GeneratedColumn<String> get sourceName => $composableBuilder(
    column: $table.sourceName,
    builder: (column) => column,
  );

  GeneratedColumn<String> get paymentMethod => $composableBuilder(
    column: $table.paymentMethod,
    builder: (column) => column,
  );

  GeneratedColumn<String> get accountHint => $composableBuilder(
    column: $table.accountHint,
    builder: (column) => column,
  );

  GeneratedColumn<bool> get includeInAnalytics => $composableBuilder(
    column: $table.includeInAnalytics,
    builder: (column) => column,
  );

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<String> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$CashflowEventsTableTableManager
    extends
        RootTableManager<
          _$FlowmDatabase,
          $CashflowEventsTable,
          CashflowEventRow,
          $$CashflowEventsTableFilterComposer,
          $$CashflowEventsTableOrderingComposer,
          $$CashflowEventsTableAnnotationComposer,
          $$CashflowEventsTableCreateCompanionBuilder,
          $$CashflowEventsTableUpdateCompanionBuilder,
          (
            CashflowEventRow,
            BaseReferences<
              _$FlowmDatabase,
              $CashflowEventsTable,
              CashflowEventRow
            >,
          ),
          CashflowEventRow,
          PrefetchHooks Function()
        > {
  $$CashflowEventsTableTableManager(
    _$FlowmDatabase db,
    $CashflowEventsTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$CashflowEventsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$CashflowEventsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$CashflowEventsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> eventDate = const Value.absent(),
                Value<String?> occurredAt = const Value.absent(),
                Value<String?> title = const Value.absent(),
                Value<String?> counterparty = const Value.absent(),
                Value<String?> description = const Value.absent(),
                Value<String> amount = const Value.absent(),
                Value<String> currency = const Value.absent(),
                Value<String> direction = const Value.absent(),
                Value<String> flowKind = const Value.absent(),
                Value<String?> categoryId = const Value.absent(),
                Value<String> sourceKind = const Value.absent(),
                Value<String?> sourceName = const Value.absent(),
                Value<String?> paymentMethod = const Value.absent(),
                Value<String?> accountHint = const Value.absent(),
                Value<bool> includeInAnalytics = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<String> createdAt = const Value.absent(),
                Value<String> updatedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => CashflowEventsCompanion(
                id: id,
                eventDate: eventDate,
                occurredAt: occurredAt,
                title: title,
                counterparty: counterparty,
                description: description,
                amount: amount,
                currency: currency,
                direction: direction,
                flowKind: flowKind,
                categoryId: categoryId,
                sourceKind: sourceKind,
                sourceName: sourceName,
                paymentMethod: paymentMethod,
                accountHint: accountHint,
                includeInAnalytics: includeInAnalytics,
                status: status,
                createdAt: createdAt,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String eventDate,
                Value<String?> occurredAt = const Value.absent(),
                Value<String?> title = const Value.absent(),
                Value<String?> counterparty = const Value.absent(),
                Value<String?> description = const Value.absent(),
                required String amount,
                required String currency,
                required String direction,
                required String flowKind,
                Value<String?> categoryId = const Value.absent(),
                required String sourceKind,
                Value<String?> sourceName = const Value.absent(),
                Value<String?> paymentMethod = const Value.absent(),
                Value<String?> accountHint = const Value.absent(),
                required bool includeInAnalytics,
                required String status,
                required String createdAt,
                required String updatedAt,
                Value<int> rowid = const Value.absent(),
              }) => CashflowEventsCompanion.insert(
                id: id,
                eventDate: eventDate,
                occurredAt: occurredAt,
                title: title,
                counterparty: counterparty,
                description: description,
                amount: amount,
                currency: currency,
                direction: direction,
                flowKind: flowKind,
                categoryId: categoryId,
                sourceKind: sourceKind,
                sourceName: sourceName,
                paymentMethod: paymentMethod,
                accountHint: accountHint,
                includeInAnalytics: includeInAnalytics,
                status: status,
                createdAt: createdAt,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$CashflowEventsTableProcessedTableManager =
    ProcessedTableManager<
      _$FlowmDatabase,
      $CashflowEventsTable,
      CashflowEventRow,
      $$CashflowEventsTableFilterComposer,
      $$CashflowEventsTableOrderingComposer,
      $$CashflowEventsTableAnnotationComposer,
      $$CashflowEventsTableCreateCompanionBuilder,
      $$CashflowEventsTableUpdateCompanionBuilder,
      (
        CashflowEventRow,
        BaseReferences<_$FlowmDatabase, $CashflowEventsTable, CashflowEventRow>,
      ),
      CashflowEventRow,
      PrefetchHooks Function()
    >;
typedef $$CashflowEventTagsTableCreateCompanionBuilder =
    CashflowEventTagsCompanion Function({
      required String cashflowEventId,
      required String tagId,
      Value<int> rowid,
    });
typedef $$CashflowEventTagsTableUpdateCompanionBuilder =
    CashflowEventTagsCompanion Function({
      Value<String> cashflowEventId,
      Value<String> tagId,
      Value<int> rowid,
    });

class $$CashflowEventTagsTableFilterComposer
    extends Composer<_$FlowmDatabase, $CashflowEventTagsTable> {
  $$CashflowEventTagsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get cashflowEventId => $composableBuilder(
    column: $table.cashflowEventId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get tagId => $composableBuilder(
    column: $table.tagId,
    builder: (column) => ColumnFilters(column),
  );
}

class $$CashflowEventTagsTableOrderingComposer
    extends Composer<_$FlowmDatabase, $CashflowEventTagsTable> {
  $$CashflowEventTagsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get cashflowEventId => $composableBuilder(
    column: $table.cashflowEventId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get tagId => $composableBuilder(
    column: $table.tagId,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$CashflowEventTagsTableAnnotationComposer
    extends Composer<_$FlowmDatabase, $CashflowEventTagsTable> {
  $$CashflowEventTagsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get cashflowEventId => $composableBuilder(
    column: $table.cashflowEventId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get tagId =>
      $composableBuilder(column: $table.tagId, builder: (column) => column);
}

class $$CashflowEventTagsTableTableManager
    extends
        RootTableManager<
          _$FlowmDatabase,
          $CashflowEventTagsTable,
          CashflowEventTagRow,
          $$CashflowEventTagsTableFilterComposer,
          $$CashflowEventTagsTableOrderingComposer,
          $$CashflowEventTagsTableAnnotationComposer,
          $$CashflowEventTagsTableCreateCompanionBuilder,
          $$CashflowEventTagsTableUpdateCompanionBuilder,
          (
            CashflowEventTagRow,
            BaseReferences<
              _$FlowmDatabase,
              $CashflowEventTagsTable,
              CashflowEventTagRow
            >,
          ),
          CashflowEventTagRow,
          PrefetchHooks Function()
        > {
  $$CashflowEventTagsTableTableManager(
    _$FlowmDatabase db,
    $CashflowEventTagsTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$CashflowEventTagsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$CashflowEventTagsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$CashflowEventTagsTableAnnotationComposer(
                $db: db,
                $table: table,
              ),
          updateCompanionCallback:
              ({
                Value<String> cashflowEventId = const Value.absent(),
                Value<String> tagId = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => CashflowEventTagsCompanion(
                cashflowEventId: cashflowEventId,
                tagId: tagId,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String cashflowEventId,
                required String tagId,
                Value<int> rowid = const Value.absent(),
              }) => CashflowEventTagsCompanion.insert(
                cashflowEventId: cashflowEventId,
                tagId: tagId,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$CashflowEventTagsTableProcessedTableManager =
    ProcessedTableManager<
      _$FlowmDatabase,
      $CashflowEventTagsTable,
      CashflowEventTagRow,
      $$CashflowEventTagsTableFilterComposer,
      $$CashflowEventTagsTableOrderingComposer,
      $$CashflowEventTagsTableAnnotationComposer,
      $$CashflowEventTagsTableCreateCompanionBuilder,
      $$CashflowEventTagsTableUpdateCompanionBuilder,
      (
        CashflowEventTagRow,
        BaseReferences<
          _$FlowmDatabase,
          $CashflowEventTagsTable,
          CashflowEventTagRow
        >,
      ),
      CashflowEventTagRow,
      PrefetchHooks Function()
    >;
typedef $$AssetItemsTableCreateCompanionBuilder =
    AssetItemsCompanion Function({
      required String id,
      required String name,
      required String assetType,
      Value<String?> institution,
      required String defaultCurrency,
      required String valuationMethod,
      Value<String?> archivedAt,
      required int displayOrder,
      Value<String?> note,
      required String createdAt,
      required String updatedAt,
      Value<int> rowid,
    });
typedef $$AssetItemsTableUpdateCompanionBuilder =
    AssetItemsCompanion Function({
      Value<String> id,
      Value<String> name,
      Value<String> assetType,
      Value<String?> institution,
      Value<String> defaultCurrency,
      Value<String> valuationMethod,
      Value<String?> archivedAt,
      Value<int> displayOrder,
      Value<String?> note,
      Value<String> createdAt,
      Value<String> updatedAt,
      Value<int> rowid,
    });

class $$AssetItemsTableFilterComposer
    extends Composer<_$FlowmDatabase, $AssetItemsTable> {
  $$AssetItemsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get assetType => $composableBuilder(
    column: $table.assetType,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get institution => $composableBuilder(
    column: $table.institution,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get defaultCurrency => $composableBuilder(
    column: $table.defaultCurrency,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get valuationMethod => $composableBuilder(
    column: $table.valuationMethod,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get archivedAt => $composableBuilder(
    column: $table.archivedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get displayOrder => $composableBuilder(
    column: $table.displayOrder,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get note => $composableBuilder(
    column: $table.note,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$AssetItemsTableOrderingComposer
    extends Composer<_$FlowmDatabase, $AssetItemsTable> {
  $$AssetItemsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get assetType => $composableBuilder(
    column: $table.assetType,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get institution => $composableBuilder(
    column: $table.institution,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get defaultCurrency => $composableBuilder(
    column: $table.defaultCurrency,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get valuationMethod => $composableBuilder(
    column: $table.valuationMethod,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get archivedAt => $composableBuilder(
    column: $table.archivedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get displayOrder => $composableBuilder(
    column: $table.displayOrder,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get note => $composableBuilder(
    column: $table.note,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$AssetItemsTableAnnotationComposer
    extends Composer<_$FlowmDatabase, $AssetItemsTable> {
  $$AssetItemsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get assetType =>
      $composableBuilder(column: $table.assetType, builder: (column) => column);

  GeneratedColumn<String> get institution => $composableBuilder(
    column: $table.institution,
    builder: (column) => column,
  );

  GeneratedColumn<String> get defaultCurrency => $composableBuilder(
    column: $table.defaultCurrency,
    builder: (column) => column,
  );

  GeneratedColumn<String> get valuationMethod => $composableBuilder(
    column: $table.valuationMethod,
    builder: (column) => column,
  );

  GeneratedColumn<String> get archivedAt => $composableBuilder(
    column: $table.archivedAt,
    builder: (column) => column,
  );

  GeneratedColumn<int> get displayOrder => $composableBuilder(
    column: $table.displayOrder,
    builder: (column) => column,
  );

  GeneratedColumn<String> get note =>
      $composableBuilder(column: $table.note, builder: (column) => column);

  GeneratedColumn<String> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<String> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$AssetItemsTableTableManager
    extends
        RootTableManager<
          _$FlowmDatabase,
          $AssetItemsTable,
          AssetItemRow,
          $$AssetItemsTableFilterComposer,
          $$AssetItemsTableOrderingComposer,
          $$AssetItemsTableAnnotationComposer,
          $$AssetItemsTableCreateCompanionBuilder,
          $$AssetItemsTableUpdateCompanionBuilder,
          (
            AssetItemRow,
            BaseReferences<_$FlowmDatabase, $AssetItemsTable, AssetItemRow>,
          ),
          AssetItemRow,
          PrefetchHooks Function()
        > {
  $$AssetItemsTableTableManager(_$FlowmDatabase db, $AssetItemsTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$AssetItemsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$AssetItemsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$AssetItemsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<String> assetType = const Value.absent(),
                Value<String?> institution = const Value.absent(),
                Value<String> defaultCurrency = const Value.absent(),
                Value<String> valuationMethod = const Value.absent(),
                Value<String?> archivedAt = const Value.absent(),
                Value<int> displayOrder = const Value.absent(),
                Value<String?> note = const Value.absent(),
                Value<String> createdAt = const Value.absent(),
                Value<String> updatedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => AssetItemsCompanion(
                id: id,
                name: name,
                assetType: assetType,
                institution: institution,
                defaultCurrency: defaultCurrency,
                valuationMethod: valuationMethod,
                archivedAt: archivedAt,
                displayOrder: displayOrder,
                note: note,
                createdAt: createdAt,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String name,
                required String assetType,
                Value<String?> institution = const Value.absent(),
                required String defaultCurrency,
                required String valuationMethod,
                Value<String?> archivedAt = const Value.absent(),
                required int displayOrder,
                Value<String?> note = const Value.absent(),
                required String createdAt,
                required String updatedAt,
                Value<int> rowid = const Value.absent(),
              }) => AssetItemsCompanion.insert(
                id: id,
                name: name,
                assetType: assetType,
                institution: institution,
                defaultCurrency: defaultCurrency,
                valuationMethod: valuationMethod,
                archivedAt: archivedAt,
                displayOrder: displayOrder,
                note: note,
                createdAt: createdAt,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$AssetItemsTableProcessedTableManager =
    ProcessedTableManager<
      _$FlowmDatabase,
      $AssetItemsTable,
      AssetItemRow,
      $$AssetItemsTableFilterComposer,
      $$AssetItemsTableOrderingComposer,
      $$AssetItemsTableAnnotationComposer,
      $$AssetItemsTableCreateCompanionBuilder,
      $$AssetItemsTableUpdateCompanionBuilder,
      (
        AssetItemRow,
        BaseReferences<_$FlowmDatabase, $AssetItemsTable, AssetItemRow>,
      ),
      AssetItemRow,
      PrefetchHooks Function()
    >;
typedef $$AssetSnapshotsTableCreateCompanionBuilder =
    AssetSnapshotsCompanion Function({
      required String id,
      required String assetItemId,
      required String snapshotAt,
      required String valueAmount,
      required String valueCurrency,
      Value<String?> note,
      required String createdAt,
      Value<int> rowid,
    });
typedef $$AssetSnapshotsTableUpdateCompanionBuilder =
    AssetSnapshotsCompanion Function({
      Value<String> id,
      Value<String> assetItemId,
      Value<String> snapshotAt,
      Value<String> valueAmount,
      Value<String> valueCurrency,
      Value<String?> note,
      Value<String> createdAt,
      Value<int> rowid,
    });

class $$AssetSnapshotsTableFilterComposer
    extends Composer<_$FlowmDatabase, $AssetSnapshotsTable> {
  $$AssetSnapshotsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get assetItemId => $composableBuilder(
    column: $table.assetItemId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get snapshotAt => $composableBuilder(
    column: $table.snapshotAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get valueAmount => $composableBuilder(
    column: $table.valueAmount,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get valueCurrency => $composableBuilder(
    column: $table.valueCurrency,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get note => $composableBuilder(
    column: $table.note,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$AssetSnapshotsTableOrderingComposer
    extends Composer<_$FlowmDatabase, $AssetSnapshotsTable> {
  $$AssetSnapshotsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get assetItemId => $composableBuilder(
    column: $table.assetItemId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get snapshotAt => $composableBuilder(
    column: $table.snapshotAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get valueAmount => $composableBuilder(
    column: $table.valueAmount,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get valueCurrency => $composableBuilder(
    column: $table.valueCurrency,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get note => $composableBuilder(
    column: $table.note,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$AssetSnapshotsTableAnnotationComposer
    extends Composer<_$FlowmDatabase, $AssetSnapshotsTable> {
  $$AssetSnapshotsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get assetItemId => $composableBuilder(
    column: $table.assetItemId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get snapshotAt => $composableBuilder(
    column: $table.snapshotAt,
    builder: (column) => column,
  );

  GeneratedColumn<String> get valueAmount => $composableBuilder(
    column: $table.valueAmount,
    builder: (column) => column,
  );

  GeneratedColumn<String> get valueCurrency => $composableBuilder(
    column: $table.valueCurrency,
    builder: (column) => column,
  );

  GeneratedColumn<String> get note =>
      $composableBuilder(column: $table.note, builder: (column) => column);

  GeneratedColumn<String> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);
}

class $$AssetSnapshotsTableTableManager
    extends
        RootTableManager<
          _$FlowmDatabase,
          $AssetSnapshotsTable,
          AssetSnapshotRow,
          $$AssetSnapshotsTableFilterComposer,
          $$AssetSnapshotsTableOrderingComposer,
          $$AssetSnapshotsTableAnnotationComposer,
          $$AssetSnapshotsTableCreateCompanionBuilder,
          $$AssetSnapshotsTableUpdateCompanionBuilder,
          (
            AssetSnapshotRow,
            BaseReferences<
              _$FlowmDatabase,
              $AssetSnapshotsTable,
              AssetSnapshotRow
            >,
          ),
          AssetSnapshotRow,
          PrefetchHooks Function()
        > {
  $$AssetSnapshotsTableTableManager(
    _$FlowmDatabase db,
    $AssetSnapshotsTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$AssetSnapshotsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$AssetSnapshotsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$AssetSnapshotsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> assetItemId = const Value.absent(),
                Value<String> snapshotAt = const Value.absent(),
                Value<String> valueAmount = const Value.absent(),
                Value<String> valueCurrency = const Value.absent(),
                Value<String?> note = const Value.absent(),
                Value<String> createdAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => AssetSnapshotsCompanion(
                id: id,
                assetItemId: assetItemId,
                snapshotAt: snapshotAt,
                valueAmount: valueAmount,
                valueCurrency: valueCurrency,
                note: note,
                createdAt: createdAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String assetItemId,
                required String snapshotAt,
                required String valueAmount,
                required String valueCurrency,
                Value<String?> note = const Value.absent(),
                required String createdAt,
                Value<int> rowid = const Value.absent(),
              }) => AssetSnapshotsCompanion.insert(
                id: id,
                assetItemId: assetItemId,
                snapshotAt: snapshotAt,
                valueAmount: valueAmount,
                valueCurrency: valueCurrency,
                note: note,
                createdAt: createdAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$AssetSnapshotsTableProcessedTableManager =
    ProcessedTableManager<
      _$FlowmDatabase,
      $AssetSnapshotsTable,
      AssetSnapshotRow,
      $$AssetSnapshotsTableFilterComposer,
      $$AssetSnapshotsTableOrderingComposer,
      $$AssetSnapshotsTableAnnotationComposer,
      $$AssetSnapshotsTableCreateCompanionBuilder,
      $$AssetSnapshotsTableUpdateCompanionBuilder,
      (
        AssetSnapshotRow,
        BaseReferences<_$FlowmDatabase, $AssetSnapshotsTable, AssetSnapshotRow>,
      ),
      AssetSnapshotRow,
      PrefetchHooks Function()
    >;
typedef $$SubscriptionsTableCreateCompanionBuilder =
    SubscriptionsCompanion Function({
      required String id,
      required String name,
      Value<String?> merchant,
      required String amount,
      required String currency,
      required String billingCycle,
      required int intervalCount,
      required String nextChargeDate,
      required bool autoRenew,
      Value<String?> categoryId,
      required String status,
      Value<String?> note,
      required String createdAt,
      required String updatedAt,
      Value<int> rowid,
    });
typedef $$SubscriptionsTableUpdateCompanionBuilder =
    SubscriptionsCompanion Function({
      Value<String> id,
      Value<String> name,
      Value<String?> merchant,
      Value<String> amount,
      Value<String> currency,
      Value<String> billingCycle,
      Value<int> intervalCount,
      Value<String> nextChargeDate,
      Value<bool> autoRenew,
      Value<String?> categoryId,
      Value<String> status,
      Value<String?> note,
      Value<String> createdAt,
      Value<String> updatedAt,
      Value<int> rowid,
    });

class $$SubscriptionsTableFilterComposer
    extends Composer<_$FlowmDatabase, $SubscriptionsTable> {
  $$SubscriptionsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get merchant => $composableBuilder(
    column: $table.merchant,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get amount => $composableBuilder(
    column: $table.amount,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get currency => $composableBuilder(
    column: $table.currency,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get billingCycle => $composableBuilder(
    column: $table.billingCycle,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get intervalCount => $composableBuilder(
    column: $table.intervalCount,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get nextChargeDate => $composableBuilder(
    column: $table.nextChargeDate,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get autoRenew => $composableBuilder(
    column: $table.autoRenew,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get categoryId => $composableBuilder(
    column: $table.categoryId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get note => $composableBuilder(
    column: $table.note,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$SubscriptionsTableOrderingComposer
    extends Composer<_$FlowmDatabase, $SubscriptionsTable> {
  $$SubscriptionsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get merchant => $composableBuilder(
    column: $table.merchant,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get amount => $composableBuilder(
    column: $table.amount,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get currency => $composableBuilder(
    column: $table.currency,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get billingCycle => $composableBuilder(
    column: $table.billingCycle,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get intervalCount => $composableBuilder(
    column: $table.intervalCount,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get nextChargeDate => $composableBuilder(
    column: $table.nextChargeDate,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get autoRenew => $composableBuilder(
    column: $table.autoRenew,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get categoryId => $composableBuilder(
    column: $table.categoryId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get note => $composableBuilder(
    column: $table.note,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$SubscriptionsTableAnnotationComposer
    extends Composer<_$FlowmDatabase, $SubscriptionsTable> {
  $$SubscriptionsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get merchant =>
      $composableBuilder(column: $table.merchant, builder: (column) => column);

  GeneratedColumn<String> get amount =>
      $composableBuilder(column: $table.amount, builder: (column) => column);

  GeneratedColumn<String> get currency =>
      $composableBuilder(column: $table.currency, builder: (column) => column);

  GeneratedColumn<String> get billingCycle => $composableBuilder(
    column: $table.billingCycle,
    builder: (column) => column,
  );

  GeneratedColumn<int> get intervalCount => $composableBuilder(
    column: $table.intervalCount,
    builder: (column) => column,
  );

  GeneratedColumn<String> get nextChargeDate => $composableBuilder(
    column: $table.nextChargeDate,
    builder: (column) => column,
  );

  GeneratedColumn<bool> get autoRenew =>
      $composableBuilder(column: $table.autoRenew, builder: (column) => column);

  GeneratedColumn<String> get categoryId => $composableBuilder(
    column: $table.categoryId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get note =>
      $composableBuilder(column: $table.note, builder: (column) => column);

  GeneratedColumn<String> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<String> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$SubscriptionsTableTableManager
    extends
        RootTableManager<
          _$FlowmDatabase,
          $SubscriptionsTable,
          SubscriptionRow,
          $$SubscriptionsTableFilterComposer,
          $$SubscriptionsTableOrderingComposer,
          $$SubscriptionsTableAnnotationComposer,
          $$SubscriptionsTableCreateCompanionBuilder,
          $$SubscriptionsTableUpdateCompanionBuilder,
          (
            SubscriptionRow,
            BaseReferences<
              _$FlowmDatabase,
              $SubscriptionsTable,
              SubscriptionRow
            >,
          ),
          SubscriptionRow,
          PrefetchHooks Function()
        > {
  $$SubscriptionsTableTableManager(
    _$FlowmDatabase db,
    $SubscriptionsTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SubscriptionsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SubscriptionsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SubscriptionsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<String?> merchant = const Value.absent(),
                Value<String> amount = const Value.absent(),
                Value<String> currency = const Value.absent(),
                Value<String> billingCycle = const Value.absent(),
                Value<int> intervalCount = const Value.absent(),
                Value<String> nextChargeDate = const Value.absent(),
                Value<bool> autoRenew = const Value.absent(),
                Value<String?> categoryId = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<String?> note = const Value.absent(),
                Value<String> createdAt = const Value.absent(),
                Value<String> updatedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => SubscriptionsCompanion(
                id: id,
                name: name,
                merchant: merchant,
                amount: amount,
                currency: currency,
                billingCycle: billingCycle,
                intervalCount: intervalCount,
                nextChargeDate: nextChargeDate,
                autoRenew: autoRenew,
                categoryId: categoryId,
                status: status,
                note: note,
                createdAt: createdAt,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String name,
                Value<String?> merchant = const Value.absent(),
                required String amount,
                required String currency,
                required String billingCycle,
                required int intervalCount,
                required String nextChargeDate,
                required bool autoRenew,
                Value<String?> categoryId = const Value.absent(),
                required String status,
                Value<String?> note = const Value.absent(),
                required String createdAt,
                required String updatedAt,
                Value<int> rowid = const Value.absent(),
              }) => SubscriptionsCompanion.insert(
                id: id,
                name: name,
                merchant: merchant,
                amount: amount,
                currency: currency,
                billingCycle: billingCycle,
                intervalCount: intervalCount,
                nextChargeDate: nextChargeDate,
                autoRenew: autoRenew,
                categoryId: categoryId,
                status: status,
                note: note,
                createdAt: createdAt,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$SubscriptionsTableProcessedTableManager =
    ProcessedTableManager<
      _$FlowmDatabase,
      $SubscriptionsTable,
      SubscriptionRow,
      $$SubscriptionsTableFilterComposer,
      $$SubscriptionsTableOrderingComposer,
      $$SubscriptionsTableAnnotationComposer,
      $$SubscriptionsTableCreateCompanionBuilder,
      $$SubscriptionsTableUpdateCompanionBuilder,
      (
        SubscriptionRow,
        BaseReferences<_$FlowmDatabase, $SubscriptionsTable, SubscriptionRow>,
      ),
      SubscriptionRow,
      PrefetchHooks Function()
    >;
typedef $$SubscriptionOccurrencesTableCreateCompanionBuilder =
    SubscriptionOccurrencesCompanion Function({
      required String id,
      required String subscriptionId,
      required String dueDate,
      required String amount,
      required String currency,
      required String status,
      required String createdAt,
      Value<int> rowid,
    });
typedef $$SubscriptionOccurrencesTableUpdateCompanionBuilder =
    SubscriptionOccurrencesCompanion Function({
      Value<String> id,
      Value<String> subscriptionId,
      Value<String> dueDate,
      Value<String> amount,
      Value<String> currency,
      Value<String> status,
      Value<String> createdAt,
      Value<int> rowid,
    });

class $$SubscriptionOccurrencesTableFilterComposer
    extends Composer<_$FlowmDatabase, $SubscriptionOccurrencesTable> {
  $$SubscriptionOccurrencesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get subscriptionId => $composableBuilder(
    column: $table.subscriptionId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get dueDate => $composableBuilder(
    column: $table.dueDate,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get amount => $composableBuilder(
    column: $table.amount,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get currency => $composableBuilder(
    column: $table.currency,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$SubscriptionOccurrencesTableOrderingComposer
    extends Composer<_$FlowmDatabase, $SubscriptionOccurrencesTable> {
  $$SubscriptionOccurrencesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get subscriptionId => $composableBuilder(
    column: $table.subscriptionId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get dueDate => $composableBuilder(
    column: $table.dueDate,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get amount => $composableBuilder(
    column: $table.amount,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get currency => $composableBuilder(
    column: $table.currency,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$SubscriptionOccurrencesTableAnnotationComposer
    extends Composer<_$FlowmDatabase, $SubscriptionOccurrencesTable> {
  $$SubscriptionOccurrencesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get subscriptionId => $composableBuilder(
    column: $table.subscriptionId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get dueDate =>
      $composableBuilder(column: $table.dueDate, builder: (column) => column);

  GeneratedColumn<String> get amount =>
      $composableBuilder(column: $table.amount, builder: (column) => column);

  GeneratedColumn<String> get currency =>
      $composableBuilder(column: $table.currency, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);
}

class $$SubscriptionOccurrencesTableTableManager
    extends
        RootTableManager<
          _$FlowmDatabase,
          $SubscriptionOccurrencesTable,
          SubscriptionOccurrenceRow,
          $$SubscriptionOccurrencesTableFilterComposer,
          $$SubscriptionOccurrencesTableOrderingComposer,
          $$SubscriptionOccurrencesTableAnnotationComposer,
          $$SubscriptionOccurrencesTableCreateCompanionBuilder,
          $$SubscriptionOccurrencesTableUpdateCompanionBuilder,
          (
            SubscriptionOccurrenceRow,
            BaseReferences<
              _$FlowmDatabase,
              $SubscriptionOccurrencesTable,
              SubscriptionOccurrenceRow
            >,
          ),
          SubscriptionOccurrenceRow,
          PrefetchHooks Function()
        > {
  $$SubscriptionOccurrencesTableTableManager(
    _$FlowmDatabase db,
    $SubscriptionOccurrencesTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SubscriptionOccurrencesTableFilterComposer(
                $db: db,
                $table: table,
              ),
          createOrderingComposer: () =>
              $$SubscriptionOccurrencesTableOrderingComposer(
                $db: db,
                $table: table,
              ),
          createComputedFieldComposer: () =>
              $$SubscriptionOccurrencesTableAnnotationComposer(
                $db: db,
                $table: table,
              ),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> subscriptionId = const Value.absent(),
                Value<String> dueDate = const Value.absent(),
                Value<String> amount = const Value.absent(),
                Value<String> currency = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<String> createdAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => SubscriptionOccurrencesCompanion(
                id: id,
                subscriptionId: subscriptionId,
                dueDate: dueDate,
                amount: amount,
                currency: currency,
                status: status,
                createdAt: createdAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String subscriptionId,
                required String dueDate,
                required String amount,
                required String currency,
                required String status,
                required String createdAt,
                Value<int> rowid = const Value.absent(),
              }) => SubscriptionOccurrencesCompanion.insert(
                id: id,
                subscriptionId: subscriptionId,
                dueDate: dueDate,
                amount: amount,
                currency: currency,
                status: status,
                createdAt: createdAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$SubscriptionOccurrencesTableProcessedTableManager =
    ProcessedTableManager<
      _$FlowmDatabase,
      $SubscriptionOccurrencesTable,
      SubscriptionOccurrenceRow,
      $$SubscriptionOccurrencesTableFilterComposer,
      $$SubscriptionOccurrencesTableOrderingComposer,
      $$SubscriptionOccurrencesTableAnnotationComposer,
      $$SubscriptionOccurrencesTableCreateCompanionBuilder,
      $$SubscriptionOccurrencesTableUpdateCompanionBuilder,
      (
        SubscriptionOccurrenceRow,
        BaseReferences<
          _$FlowmDatabase,
          $SubscriptionOccurrencesTable,
          SubscriptionOccurrenceRow
        >,
      ),
      SubscriptionOccurrenceRow,
      PrefetchHooks Function()
    >;
typedef $$LoansTableCreateCompanionBuilder =
    LoansCompanion Function({
      required String id,
      required String name,
      Value<String?> lender,
      required String currency,
      Value<String?> principalAmount,
      Value<String?> currentPrincipalEstimate,
      Value<int?> annualRateBps,
      Value<String?> repaymentMethod,
      required String paymentAmount,
      Value<int?> paymentDay,
      required String startDate,
      Value<int?> termMonths,
      required String status,
      Value<String?> note,
      required String createdAt,
      required String updatedAt,
      Value<int> rowid,
    });
typedef $$LoansTableUpdateCompanionBuilder =
    LoansCompanion Function({
      Value<String> id,
      Value<String> name,
      Value<String?> lender,
      Value<String> currency,
      Value<String?> principalAmount,
      Value<String?> currentPrincipalEstimate,
      Value<int?> annualRateBps,
      Value<String?> repaymentMethod,
      Value<String> paymentAmount,
      Value<int?> paymentDay,
      Value<String> startDate,
      Value<int?> termMonths,
      Value<String> status,
      Value<String?> note,
      Value<String> createdAt,
      Value<String> updatedAt,
      Value<int> rowid,
    });

class $$LoansTableFilterComposer
    extends Composer<_$FlowmDatabase, $LoansTable> {
  $$LoansTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get lender => $composableBuilder(
    column: $table.lender,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get currency => $composableBuilder(
    column: $table.currency,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get principalAmount => $composableBuilder(
    column: $table.principalAmount,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get currentPrincipalEstimate => $composableBuilder(
    column: $table.currentPrincipalEstimate,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get annualRateBps => $composableBuilder(
    column: $table.annualRateBps,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get repaymentMethod => $composableBuilder(
    column: $table.repaymentMethod,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get paymentAmount => $composableBuilder(
    column: $table.paymentAmount,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get paymentDay => $composableBuilder(
    column: $table.paymentDay,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get startDate => $composableBuilder(
    column: $table.startDate,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get termMonths => $composableBuilder(
    column: $table.termMonths,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get note => $composableBuilder(
    column: $table.note,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$LoansTableOrderingComposer
    extends Composer<_$FlowmDatabase, $LoansTable> {
  $$LoansTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get lender => $composableBuilder(
    column: $table.lender,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get currency => $composableBuilder(
    column: $table.currency,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get principalAmount => $composableBuilder(
    column: $table.principalAmount,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get currentPrincipalEstimate => $composableBuilder(
    column: $table.currentPrincipalEstimate,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get annualRateBps => $composableBuilder(
    column: $table.annualRateBps,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get repaymentMethod => $composableBuilder(
    column: $table.repaymentMethod,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get paymentAmount => $composableBuilder(
    column: $table.paymentAmount,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get paymentDay => $composableBuilder(
    column: $table.paymentDay,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get startDate => $composableBuilder(
    column: $table.startDate,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get termMonths => $composableBuilder(
    column: $table.termMonths,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get note => $composableBuilder(
    column: $table.note,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$LoansTableAnnotationComposer
    extends Composer<_$FlowmDatabase, $LoansTable> {
  $$LoansTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get lender =>
      $composableBuilder(column: $table.lender, builder: (column) => column);

  GeneratedColumn<String> get currency =>
      $composableBuilder(column: $table.currency, builder: (column) => column);

  GeneratedColumn<String> get principalAmount => $composableBuilder(
    column: $table.principalAmount,
    builder: (column) => column,
  );

  GeneratedColumn<String> get currentPrincipalEstimate => $composableBuilder(
    column: $table.currentPrincipalEstimate,
    builder: (column) => column,
  );

  GeneratedColumn<int> get annualRateBps => $composableBuilder(
    column: $table.annualRateBps,
    builder: (column) => column,
  );

  GeneratedColumn<String> get repaymentMethod => $composableBuilder(
    column: $table.repaymentMethod,
    builder: (column) => column,
  );

  GeneratedColumn<String> get paymentAmount => $composableBuilder(
    column: $table.paymentAmount,
    builder: (column) => column,
  );

  GeneratedColumn<int> get paymentDay => $composableBuilder(
    column: $table.paymentDay,
    builder: (column) => column,
  );

  GeneratedColumn<String> get startDate =>
      $composableBuilder(column: $table.startDate, builder: (column) => column);

  GeneratedColumn<int> get termMonths => $composableBuilder(
    column: $table.termMonths,
    builder: (column) => column,
  );

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get note =>
      $composableBuilder(column: $table.note, builder: (column) => column);

  GeneratedColumn<String> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<String> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$LoansTableTableManager
    extends
        RootTableManager<
          _$FlowmDatabase,
          $LoansTable,
          LoanRow,
          $$LoansTableFilterComposer,
          $$LoansTableOrderingComposer,
          $$LoansTableAnnotationComposer,
          $$LoansTableCreateCompanionBuilder,
          $$LoansTableUpdateCompanionBuilder,
          (LoanRow, BaseReferences<_$FlowmDatabase, $LoansTable, LoanRow>),
          LoanRow,
          PrefetchHooks Function()
        > {
  $$LoansTableTableManager(_$FlowmDatabase db, $LoansTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LoansTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$LoansTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$LoansTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<String?> lender = const Value.absent(),
                Value<String> currency = const Value.absent(),
                Value<String?> principalAmount = const Value.absent(),
                Value<String?> currentPrincipalEstimate = const Value.absent(),
                Value<int?> annualRateBps = const Value.absent(),
                Value<String?> repaymentMethod = const Value.absent(),
                Value<String> paymentAmount = const Value.absent(),
                Value<int?> paymentDay = const Value.absent(),
                Value<String> startDate = const Value.absent(),
                Value<int?> termMonths = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<String?> note = const Value.absent(),
                Value<String> createdAt = const Value.absent(),
                Value<String> updatedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LoansCompanion(
                id: id,
                name: name,
                lender: lender,
                currency: currency,
                principalAmount: principalAmount,
                currentPrincipalEstimate: currentPrincipalEstimate,
                annualRateBps: annualRateBps,
                repaymentMethod: repaymentMethod,
                paymentAmount: paymentAmount,
                paymentDay: paymentDay,
                startDate: startDate,
                termMonths: termMonths,
                status: status,
                note: note,
                createdAt: createdAt,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String name,
                Value<String?> lender = const Value.absent(),
                required String currency,
                Value<String?> principalAmount = const Value.absent(),
                Value<String?> currentPrincipalEstimate = const Value.absent(),
                Value<int?> annualRateBps = const Value.absent(),
                Value<String?> repaymentMethod = const Value.absent(),
                required String paymentAmount,
                Value<int?> paymentDay = const Value.absent(),
                required String startDate,
                Value<int?> termMonths = const Value.absent(),
                required String status,
                Value<String?> note = const Value.absent(),
                required String createdAt,
                required String updatedAt,
                Value<int> rowid = const Value.absent(),
              }) => LoansCompanion.insert(
                id: id,
                name: name,
                lender: lender,
                currency: currency,
                principalAmount: principalAmount,
                currentPrincipalEstimate: currentPrincipalEstimate,
                annualRateBps: annualRateBps,
                repaymentMethod: repaymentMethod,
                paymentAmount: paymentAmount,
                paymentDay: paymentDay,
                startDate: startDate,
                termMonths: termMonths,
                status: status,
                note: note,
                createdAt: createdAt,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$LoansTableProcessedTableManager =
    ProcessedTableManager<
      _$FlowmDatabase,
      $LoansTable,
      LoanRow,
      $$LoansTableFilterComposer,
      $$LoansTableOrderingComposer,
      $$LoansTableAnnotationComposer,
      $$LoansTableCreateCompanionBuilder,
      $$LoansTableUpdateCompanionBuilder,
      (LoanRow, BaseReferences<_$FlowmDatabase, $LoansTable, LoanRow>),
      LoanRow,
      PrefetchHooks Function()
    >;
typedef $$LoanPaymentOccurrencesTableCreateCompanionBuilder =
    LoanPaymentOccurrencesCompanion Function({
      required String id,
      required String loanId,
      required String dueDate,
      required String paymentAmount,
      Value<String?> remainingPrincipalEstimate,
      required String status,
      required String createdAt,
      Value<int> rowid,
    });
typedef $$LoanPaymentOccurrencesTableUpdateCompanionBuilder =
    LoanPaymentOccurrencesCompanion Function({
      Value<String> id,
      Value<String> loanId,
      Value<String> dueDate,
      Value<String> paymentAmount,
      Value<String?> remainingPrincipalEstimate,
      Value<String> status,
      Value<String> createdAt,
      Value<int> rowid,
    });

class $$LoanPaymentOccurrencesTableFilterComposer
    extends Composer<_$FlowmDatabase, $LoanPaymentOccurrencesTable> {
  $$LoanPaymentOccurrencesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get loanId => $composableBuilder(
    column: $table.loanId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get dueDate => $composableBuilder(
    column: $table.dueDate,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get paymentAmount => $composableBuilder(
    column: $table.paymentAmount,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get remainingPrincipalEstimate => $composableBuilder(
    column: $table.remainingPrincipalEstimate,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$LoanPaymentOccurrencesTableOrderingComposer
    extends Composer<_$FlowmDatabase, $LoanPaymentOccurrencesTable> {
  $$LoanPaymentOccurrencesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get loanId => $composableBuilder(
    column: $table.loanId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get dueDate => $composableBuilder(
    column: $table.dueDate,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get paymentAmount => $composableBuilder(
    column: $table.paymentAmount,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get remainingPrincipalEstimate => $composableBuilder(
    column: $table.remainingPrincipalEstimate,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$LoanPaymentOccurrencesTableAnnotationComposer
    extends Composer<_$FlowmDatabase, $LoanPaymentOccurrencesTable> {
  $$LoanPaymentOccurrencesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get loanId =>
      $composableBuilder(column: $table.loanId, builder: (column) => column);

  GeneratedColumn<String> get dueDate =>
      $composableBuilder(column: $table.dueDate, builder: (column) => column);

  GeneratedColumn<String> get paymentAmount => $composableBuilder(
    column: $table.paymentAmount,
    builder: (column) => column,
  );

  GeneratedColumn<String> get remainingPrincipalEstimate => $composableBuilder(
    column: $table.remainingPrincipalEstimate,
    builder: (column) => column,
  );

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);
}

class $$LoanPaymentOccurrencesTableTableManager
    extends
        RootTableManager<
          _$FlowmDatabase,
          $LoanPaymentOccurrencesTable,
          LoanPaymentOccurrenceRow,
          $$LoanPaymentOccurrencesTableFilterComposer,
          $$LoanPaymentOccurrencesTableOrderingComposer,
          $$LoanPaymentOccurrencesTableAnnotationComposer,
          $$LoanPaymentOccurrencesTableCreateCompanionBuilder,
          $$LoanPaymentOccurrencesTableUpdateCompanionBuilder,
          (
            LoanPaymentOccurrenceRow,
            BaseReferences<
              _$FlowmDatabase,
              $LoanPaymentOccurrencesTable,
              LoanPaymentOccurrenceRow
            >,
          ),
          LoanPaymentOccurrenceRow,
          PrefetchHooks Function()
        > {
  $$LoanPaymentOccurrencesTableTableManager(
    _$FlowmDatabase db,
    $LoanPaymentOccurrencesTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LoanPaymentOccurrencesTableFilterComposer(
                $db: db,
                $table: table,
              ),
          createOrderingComposer: () =>
              $$LoanPaymentOccurrencesTableOrderingComposer(
                $db: db,
                $table: table,
              ),
          createComputedFieldComposer: () =>
              $$LoanPaymentOccurrencesTableAnnotationComposer(
                $db: db,
                $table: table,
              ),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> loanId = const Value.absent(),
                Value<String> dueDate = const Value.absent(),
                Value<String> paymentAmount = const Value.absent(),
                Value<String?> remainingPrincipalEstimate =
                    const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<String> createdAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LoanPaymentOccurrencesCompanion(
                id: id,
                loanId: loanId,
                dueDate: dueDate,
                paymentAmount: paymentAmount,
                remainingPrincipalEstimate: remainingPrincipalEstimate,
                status: status,
                createdAt: createdAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String loanId,
                required String dueDate,
                required String paymentAmount,
                Value<String?> remainingPrincipalEstimate =
                    const Value.absent(),
                required String status,
                required String createdAt,
                Value<int> rowid = const Value.absent(),
              }) => LoanPaymentOccurrencesCompanion.insert(
                id: id,
                loanId: loanId,
                dueDate: dueDate,
                paymentAmount: paymentAmount,
                remainingPrincipalEstimate: remainingPrincipalEstimate,
                status: status,
                createdAt: createdAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$LoanPaymentOccurrencesTableProcessedTableManager =
    ProcessedTableManager<
      _$FlowmDatabase,
      $LoanPaymentOccurrencesTable,
      LoanPaymentOccurrenceRow,
      $$LoanPaymentOccurrencesTableFilterComposer,
      $$LoanPaymentOccurrencesTableOrderingComposer,
      $$LoanPaymentOccurrencesTableAnnotationComposer,
      $$LoanPaymentOccurrencesTableCreateCompanionBuilder,
      $$LoanPaymentOccurrencesTableUpdateCompanionBuilder,
      (
        LoanPaymentOccurrenceRow,
        BaseReferences<
          _$FlowmDatabase,
          $LoanPaymentOccurrencesTable,
          LoanPaymentOccurrenceRow
        >,
      ),
      LoanPaymentOccurrenceRow,
      PrefetchHooks Function()
    >;
typedef $$BudgetSetsTableCreateCompanionBuilder =
    BudgetSetsCompanion Function({
      required String id,
      required String name,
      required String status,
      required String createdAt,
      required String updatedAt,
      Value<int> rowid,
    });
typedef $$BudgetSetsTableUpdateCompanionBuilder =
    BudgetSetsCompanion Function({
      Value<String> id,
      Value<String> name,
      Value<String> status,
      Value<String> createdAt,
      Value<String> updatedAt,
      Value<int> rowid,
    });

class $$BudgetSetsTableFilterComposer
    extends Composer<_$FlowmDatabase, $BudgetSetsTable> {
  $$BudgetSetsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$BudgetSetsTableOrderingComposer
    extends Composer<_$FlowmDatabase, $BudgetSetsTable> {
  $$BudgetSetsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$BudgetSetsTableAnnotationComposer
    extends Composer<_$FlowmDatabase, $BudgetSetsTable> {
  $$BudgetSetsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<String> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$BudgetSetsTableTableManager
    extends
        RootTableManager<
          _$FlowmDatabase,
          $BudgetSetsTable,
          BudgetSetRow,
          $$BudgetSetsTableFilterComposer,
          $$BudgetSetsTableOrderingComposer,
          $$BudgetSetsTableAnnotationComposer,
          $$BudgetSetsTableCreateCompanionBuilder,
          $$BudgetSetsTableUpdateCompanionBuilder,
          (
            BudgetSetRow,
            BaseReferences<_$FlowmDatabase, $BudgetSetsTable, BudgetSetRow>,
          ),
          BudgetSetRow,
          PrefetchHooks Function()
        > {
  $$BudgetSetsTableTableManager(_$FlowmDatabase db, $BudgetSetsTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$BudgetSetsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$BudgetSetsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$BudgetSetsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<String> createdAt = const Value.absent(),
                Value<String> updatedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => BudgetSetsCompanion(
                id: id,
                name: name,
                status: status,
                createdAt: createdAt,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String name,
                required String status,
                required String createdAt,
                required String updatedAt,
                Value<int> rowid = const Value.absent(),
              }) => BudgetSetsCompanion.insert(
                id: id,
                name: name,
                status: status,
                createdAt: createdAt,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$BudgetSetsTableProcessedTableManager =
    ProcessedTableManager<
      _$FlowmDatabase,
      $BudgetSetsTable,
      BudgetSetRow,
      $$BudgetSetsTableFilterComposer,
      $$BudgetSetsTableOrderingComposer,
      $$BudgetSetsTableAnnotationComposer,
      $$BudgetSetsTableCreateCompanionBuilder,
      $$BudgetSetsTableUpdateCompanionBuilder,
      (
        BudgetSetRow,
        BaseReferences<_$FlowmDatabase, $BudgetSetsTable, BudgetSetRow>,
      ),
      BudgetSetRow,
      PrefetchHooks Function()
    >;
typedef $$BudgetPeriodsTableCreateCompanionBuilder =
    BudgetPeriodsCompanion Function({
      required String id,
      required String budgetSetId,
      required String periodKind,
      required String periodStart,
      required String periodEnd,
      required String currency,
      required String status,
      Value<int> rowid,
    });
typedef $$BudgetPeriodsTableUpdateCompanionBuilder =
    BudgetPeriodsCompanion Function({
      Value<String> id,
      Value<String> budgetSetId,
      Value<String> periodKind,
      Value<String> periodStart,
      Value<String> periodEnd,
      Value<String> currency,
      Value<String> status,
      Value<int> rowid,
    });

class $$BudgetPeriodsTableFilterComposer
    extends Composer<_$FlowmDatabase, $BudgetPeriodsTable> {
  $$BudgetPeriodsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get budgetSetId => $composableBuilder(
    column: $table.budgetSetId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get periodKind => $composableBuilder(
    column: $table.periodKind,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get periodStart => $composableBuilder(
    column: $table.periodStart,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get periodEnd => $composableBuilder(
    column: $table.periodEnd,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get currency => $composableBuilder(
    column: $table.currency,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );
}

class $$BudgetPeriodsTableOrderingComposer
    extends Composer<_$FlowmDatabase, $BudgetPeriodsTable> {
  $$BudgetPeriodsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get budgetSetId => $composableBuilder(
    column: $table.budgetSetId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get periodKind => $composableBuilder(
    column: $table.periodKind,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get periodStart => $composableBuilder(
    column: $table.periodStart,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get periodEnd => $composableBuilder(
    column: $table.periodEnd,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get currency => $composableBuilder(
    column: $table.currency,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$BudgetPeriodsTableAnnotationComposer
    extends Composer<_$FlowmDatabase, $BudgetPeriodsTable> {
  $$BudgetPeriodsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get budgetSetId => $composableBuilder(
    column: $table.budgetSetId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get periodKind => $composableBuilder(
    column: $table.periodKind,
    builder: (column) => column,
  );

  GeneratedColumn<String> get periodStart => $composableBuilder(
    column: $table.periodStart,
    builder: (column) => column,
  );

  GeneratedColumn<String> get periodEnd =>
      $composableBuilder(column: $table.periodEnd, builder: (column) => column);

  GeneratedColumn<String> get currency =>
      $composableBuilder(column: $table.currency, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);
}

class $$BudgetPeriodsTableTableManager
    extends
        RootTableManager<
          _$FlowmDatabase,
          $BudgetPeriodsTable,
          BudgetPeriodRow,
          $$BudgetPeriodsTableFilterComposer,
          $$BudgetPeriodsTableOrderingComposer,
          $$BudgetPeriodsTableAnnotationComposer,
          $$BudgetPeriodsTableCreateCompanionBuilder,
          $$BudgetPeriodsTableUpdateCompanionBuilder,
          (
            BudgetPeriodRow,
            BaseReferences<
              _$FlowmDatabase,
              $BudgetPeriodsTable,
              BudgetPeriodRow
            >,
          ),
          BudgetPeriodRow,
          PrefetchHooks Function()
        > {
  $$BudgetPeriodsTableTableManager(
    _$FlowmDatabase db,
    $BudgetPeriodsTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$BudgetPeriodsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$BudgetPeriodsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$BudgetPeriodsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> budgetSetId = const Value.absent(),
                Value<String> periodKind = const Value.absent(),
                Value<String> periodStart = const Value.absent(),
                Value<String> periodEnd = const Value.absent(),
                Value<String> currency = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => BudgetPeriodsCompanion(
                id: id,
                budgetSetId: budgetSetId,
                periodKind: periodKind,
                periodStart: periodStart,
                periodEnd: periodEnd,
                currency: currency,
                status: status,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String budgetSetId,
                required String periodKind,
                required String periodStart,
                required String periodEnd,
                required String currency,
                required String status,
                Value<int> rowid = const Value.absent(),
              }) => BudgetPeriodsCompanion.insert(
                id: id,
                budgetSetId: budgetSetId,
                periodKind: periodKind,
                periodStart: periodStart,
                periodEnd: periodEnd,
                currency: currency,
                status: status,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$BudgetPeriodsTableProcessedTableManager =
    ProcessedTableManager<
      _$FlowmDatabase,
      $BudgetPeriodsTable,
      BudgetPeriodRow,
      $$BudgetPeriodsTableFilterComposer,
      $$BudgetPeriodsTableOrderingComposer,
      $$BudgetPeriodsTableAnnotationComposer,
      $$BudgetPeriodsTableCreateCompanionBuilder,
      $$BudgetPeriodsTableUpdateCompanionBuilder,
      (
        BudgetPeriodRow,
        BaseReferences<_$FlowmDatabase, $BudgetPeriodsTable, BudgetPeriodRow>,
      ),
      BudgetPeriodRow,
      PrefetchHooks Function()
    >;
typedef $$BudgetItemsTableCreateCompanionBuilder =
    BudgetItemsCompanion Function({
      required String id,
      required String budgetPeriodId,
      required String name,
      required String itemKind,
      required String plannedAmount,
      required String currency,
      Value<String?> categoryId,
      required String status,
      Value<String?> note,
      Value<String?> color,
      Value<int> rowid,
    });
typedef $$BudgetItemsTableUpdateCompanionBuilder =
    BudgetItemsCompanion Function({
      Value<String> id,
      Value<String> budgetPeriodId,
      Value<String> name,
      Value<String> itemKind,
      Value<String> plannedAmount,
      Value<String> currency,
      Value<String?> categoryId,
      Value<String> status,
      Value<String?> note,
      Value<String?> color,
      Value<int> rowid,
    });

class $$BudgetItemsTableFilterComposer
    extends Composer<_$FlowmDatabase, $BudgetItemsTable> {
  $$BudgetItemsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get budgetPeriodId => $composableBuilder(
    column: $table.budgetPeriodId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get itemKind => $composableBuilder(
    column: $table.itemKind,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get plannedAmount => $composableBuilder(
    column: $table.plannedAmount,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get currency => $composableBuilder(
    column: $table.currency,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get categoryId => $composableBuilder(
    column: $table.categoryId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get note => $composableBuilder(
    column: $table.note,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get color => $composableBuilder(
    column: $table.color,
    builder: (column) => ColumnFilters(column),
  );
}

class $$BudgetItemsTableOrderingComposer
    extends Composer<_$FlowmDatabase, $BudgetItemsTable> {
  $$BudgetItemsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get budgetPeriodId => $composableBuilder(
    column: $table.budgetPeriodId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get itemKind => $composableBuilder(
    column: $table.itemKind,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get plannedAmount => $composableBuilder(
    column: $table.plannedAmount,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get currency => $composableBuilder(
    column: $table.currency,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get categoryId => $composableBuilder(
    column: $table.categoryId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get note => $composableBuilder(
    column: $table.note,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get color => $composableBuilder(
    column: $table.color,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$BudgetItemsTableAnnotationComposer
    extends Composer<_$FlowmDatabase, $BudgetItemsTable> {
  $$BudgetItemsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get budgetPeriodId => $composableBuilder(
    column: $table.budgetPeriodId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get itemKind =>
      $composableBuilder(column: $table.itemKind, builder: (column) => column);

  GeneratedColumn<String> get plannedAmount => $composableBuilder(
    column: $table.plannedAmount,
    builder: (column) => column,
  );

  GeneratedColumn<String> get currency =>
      $composableBuilder(column: $table.currency, builder: (column) => column);

  GeneratedColumn<String> get categoryId => $composableBuilder(
    column: $table.categoryId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get note =>
      $composableBuilder(column: $table.note, builder: (column) => column);

  GeneratedColumn<String> get color =>
      $composableBuilder(column: $table.color, builder: (column) => column);
}

class $$BudgetItemsTableTableManager
    extends
        RootTableManager<
          _$FlowmDatabase,
          $BudgetItemsTable,
          BudgetItemRow,
          $$BudgetItemsTableFilterComposer,
          $$BudgetItemsTableOrderingComposer,
          $$BudgetItemsTableAnnotationComposer,
          $$BudgetItemsTableCreateCompanionBuilder,
          $$BudgetItemsTableUpdateCompanionBuilder,
          (
            BudgetItemRow,
            BaseReferences<_$FlowmDatabase, $BudgetItemsTable, BudgetItemRow>,
          ),
          BudgetItemRow,
          PrefetchHooks Function()
        > {
  $$BudgetItemsTableTableManager(_$FlowmDatabase db, $BudgetItemsTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$BudgetItemsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$BudgetItemsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$BudgetItemsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> budgetPeriodId = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<String> itemKind = const Value.absent(),
                Value<String> plannedAmount = const Value.absent(),
                Value<String> currency = const Value.absent(),
                Value<String?> categoryId = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<String?> note = const Value.absent(),
                Value<String?> color = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => BudgetItemsCompanion(
                id: id,
                budgetPeriodId: budgetPeriodId,
                name: name,
                itemKind: itemKind,
                plannedAmount: plannedAmount,
                currency: currency,
                categoryId: categoryId,
                status: status,
                note: note,
                color: color,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String budgetPeriodId,
                required String name,
                required String itemKind,
                required String plannedAmount,
                required String currency,
                Value<String?> categoryId = const Value.absent(),
                required String status,
                Value<String?> note = const Value.absent(),
                Value<String?> color = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => BudgetItemsCompanion.insert(
                id: id,
                budgetPeriodId: budgetPeriodId,
                name: name,
                itemKind: itemKind,
                plannedAmount: plannedAmount,
                currency: currency,
                categoryId: categoryId,
                status: status,
                note: note,
                color: color,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$BudgetItemsTableProcessedTableManager =
    ProcessedTableManager<
      _$FlowmDatabase,
      $BudgetItemsTable,
      BudgetItemRow,
      $$BudgetItemsTableFilterComposer,
      $$BudgetItemsTableOrderingComposer,
      $$BudgetItemsTableAnnotationComposer,
      $$BudgetItemsTableCreateCompanionBuilder,
      $$BudgetItemsTableUpdateCompanionBuilder,
      (
        BudgetItemRow,
        BaseReferences<_$FlowmDatabase, $BudgetItemsTable, BudgetItemRow>,
      ),
      BudgetItemRow,
      PrefetchHooks Function()
    >;
typedef $$CurrencySettingsTableCreateCompanionBuilder =
    CurrencySettingsCompanion Function({
      required String id,
      required String displayCurrency,
      required String updatedAt,
      Value<int> rowid,
    });
typedef $$CurrencySettingsTableUpdateCompanionBuilder =
    CurrencySettingsCompanion Function({
      Value<String> id,
      Value<String> displayCurrency,
      Value<String> updatedAt,
      Value<int> rowid,
    });

class $$CurrencySettingsTableFilterComposer
    extends Composer<_$FlowmDatabase, $CurrencySettingsTable> {
  $$CurrencySettingsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get displayCurrency => $composableBuilder(
    column: $table.displayCurrency,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$CurrencySettingsTableOrderingComposer
    extends Composer<_$FlowmDatabase, $CurrencySettingsTable> {
  $$CurrencySettingsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get displayCurrency => $composableBuilder(
    column: $table.displayCurrency,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$CurrencySettingsTableAnnotationComposer
    extends Composer<_$FlowmDatabase, $CurrencySettingsTable> {
  $$CurrencySettingsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get displayCurrency => $composableBuilder(
    column: $table.displayCurrency,
    builder: (column) => column,
  );

  GeneratedColumn<String> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$CurrencySettingsTableTableManager
    extends
        RootTableManager<
          _$FlowmDatabase,
          $CurrencySettingsTable,
          CurrencySettingRow,
          $$CurrencySettingsTableFilterComposer,
          $$CurrencySettingsTableOrderingComposer,
          $$CurrencySettingsTableAnnotationComposer,
          $$CurrencySettingsTableCreateCompanionBuilder,
          $$CurrencySettingsTableUpdateCompanionBuilder,
          (
            CurrencySettingRow,
            BaseReferences<
              _$FlowmDatabase,
              $CurrencySettingsTable,
              CurrencySettingRow
            >,
          ),
          CurrencySettingRow,
          PrefetchHooks Function()
        > {
  $$CurrencySettingsTableTableManager(
    _$FlowmDatabase db,
    $CurrencySettingsTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$CurrencySettingsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$CurrencySettingsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$CurrencySettingsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> displayCurrency = const Value.absent(),
                Value<String> updatedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => CurrencySettingsCompanion(
                id: id,
                displayCurrency: displayCurrency,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String displayCurrency,
                required String updatedAt,
                Value<int> rowid = const Value.absent(),
              }) => CurrencySettingsCompanion.insert(
                id: id,
                displayCurrency: displayCurrency,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$CurrencySettingsTableProcessedTableManager =
    ProcessedTableManager<
      _$FlowmDatabase,
      $CurrencySettingsTable,
      CurrencySettingRow,
      $$CurrencySettingsTableFilterComposer,
      $$CurrencySettingsTableOrderingComposer,
      $$CurrencySettingsTableAnnotationComposer,
      $$CurrencySettingsTableCreateCompanionBuilder,
      $$CurrencySettingsTableUpdateCompanionBuilder,
      (
        CurrencySettingRow,
        BaseReferences<
          _$FlowmDatabase,
          $CurrencySettingsTable,
          CurrencySettingRow
        >,
      ),
      CurrencySettingRow,
      PrefetchHooks Function()
    >;
typedef $$ExchangeRatesTableCreateCompanionBuilder =
    ExchangeRatesCompanion Function({
      required String id,
      required String fromCurrency,
      required String toCurrency,
      required String rateDate,
      required String rate,
      Value<int> rowid,
    });
typedef $$ExchangeRatesTableUpdateCompanionBuilder =
    ExchangeRatesCompanion Function({
      Value<String> id,
      Value<String> fromCurrency,
      Value<String> toCurrency,
      Value<String> rateDate,
      Value<String> rate,
      Value<int> rowid,
    });

class $$ExchangeRatesTableFilterComposer
    extends Composer<_$FlowmDatabase, $ExchangeRatesTable> {
  $$ExchangeRatesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get fromCurrency => $composableBuilder(
    column: $table.fromCurrency,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get toCurrency => $composableBuilder(
    column: $table.toCurrency,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get rateDate => $composableBuilder(
    column: $table.rateDate,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get rate => $composableBuilder(
    column: $table.rate,
    builder: (column) => ColumnFilters(column),
  );
}

class $$ExchangeRatesTableOrderingComposer
    extends Composer<_$FlowmDatabase, $ExchangeRatesTable> {
  $$ExchangeRatesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get fromCurrency => $composableBuilder(
    column: $table.fromCurrency,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get toCurrency => $composableBuilder(
    column: $table.toCurrency,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get rateDate => $composableBuilder(
    column: $table.rateDate,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get rate => $composableBuilder(
    column: $table.rate,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$ExchangeRatesTableAnnotationComposer
    extends Composer<_$FlowmDatabase, $ExchangeRatesTable> {
  $$ExchangeRatesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get fromCurrency => $composableBuilder(
    column: $table.fromCurrency,
    builder: (column) => column,
  );

  GeneratedColumn<String> get toCurrency => $composableBuilder(
    column: $table.toCurrency,
    builder: (column) => column,
  );

  GeneratedColumn<String> get rateDate =>
      $composableBuilder(column: $table.rateDate, builder: (column) => column);

  GeneratedColumn<String> get rate =>
      $composableBuilder(column: $table.rate, builder: (column) => column);
}

class $$ExchangeRatesTableTableManager
    extends
        RootTableManager<
          _$FlowmDatabase,
          $ExchangeRatesTable,
          ExchangeRateRow,
          $$ExchangeRatesTableFilterComposer,
          $$ExchangeRatesTableOrderingComposer,
          $$ExchangeRatesTableAnnotationComposer,
          $$ExchangeRatesTableCreateCompanionBuilder,
          $$ExchangeRatesTableUpdateCompanionBuilder,
          (
            ExchangeRateRow,
            BaseReferences<
              _$FlowmDatabase,
              $ExchangeRatesTable,
              ExchangeRateRow
            >,
          ),
          ExchangeRateRow,
          PrefetchHooks Function()
        > {
  $$ExchangeRatesTableTableManager(
    _$FlowmDatabase db,
    $ExchangeRatesTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ExchangeRatesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ExchangeRatesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$ExchangeRatesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> fromCurrency = const Value.absent(),
                Value<String> toCurrency = const Value.absent(),
                Value<String> rateDate = const Value.absent(),
                Value<String> rate = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => ExchangeRatesCompanion(
                id: id,
                fromCurrency: fromCurrency,
                toCurrency: toCurrency,
                rateDate: rateDate,
                rate: rate,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String fromCurrency,
                required String toCurrency,
                required String rateDate,
                required String rate,
                Value<int> rowid = const Value.absent(),
              }) => ExchangeRatesCompanion.insert(
                id: id,
                fromCurrency: fromCurrency,
                toCurrency: toCurrency,
                rateDate: rateDate,
                rate: rate,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$ExchangeRatesTableProcessedTableManager =
    ProcessedTableManager<
      _$FlowmDatabase,
      $ExchangeRatesTable,
      ExchangeRateRow,
      $$ExchangeRatesTableFilterComposer,
      $$ExchangeRatesTableOrderingComposer,
      $$ExchangeRatesTableAnnotationComposer,
      $$ExchangeRatesTableCreateCompanionBuilder,
      $$ExchangeRatesTableUpdateCompanionBuilder,
      (
        ExchangeRateRow,
        BaseReferences<_$FlowmDatabase, $ExchangeRatesTable, ExchangeRateRow>,
      ),
      ExchangeRateRow,
      PrefetchHooks Function()
    >;

class $FlowmDatabaseManager {
  final _$FlowmDatabase _db;
  $FlowmDatabaseManager(this._db);
  $$CategoriesTableTableManager get categories =>
      $$CategoriesTableTableManager(_db, _db.categories);
  $$TagsTableTableManager get tags => $$TagsTableTableManager(_db, _db.tags);
  $$CashflowEventsTableTableManager get cashflowEvents =>
      $$CashflowEventsTableTableManager(_db, _db.cashflowEvents);
  $$CashflowEventTagsTableTableManager get cashflowEventTags =>
      $$CashflowEventTagsTableTableManager(_db, _db.cashflowEventTags);
  $$AssetItemsTableTableManager get assetItems =>
      $$AssetItemsTableTableManager(_db, _db.assetItems);
  $$AssetSnapshotsTableTableManager get assetSnapshots =>
      $$AssetSnapshotsTableTableManager(_db, _db.assetSnapshots);
  $$SubscriptionsTableTableManager get subscriptions =>
      $$SubscriptionsTableTableManager(_db, _db.subscriptions);
  $$SubscriptionOccurrencesTableTableManager get subscriptionOccurrences =>
      $$SubscriptionOccurrencesTableTableManager(
        _db,
        _db.subscriptionOccurrences,
      );
  $$LoansTableTableManager get loans =>
      $$LoansTableTableManager(_db, _db.loans);
  $$LoanPaymentOccurrencesTableTableManager get loanPaymentOccurrences =>
      $$LoanPaymentOccurrencesTableTableManager(
        _db,
        _db.loanPaymentOccurrences,
      );
  $$BudgetSetsTableTableManager get budgetSets =>
      $$BudgetSetsTableTableManager(_db, _db.budgetSets);
  $$BudgetPeriodsTableTableManager get budgetPeriods =>
      $$BudgetPeriodsTableTableManager(_db, _db.budgetPeriods);
  $$BudgetItemsTableTableManager get budgetItems =>
      $$BudgetItemsTableTableManager(_db, _db.budgetItems);
  $$CurrencySettingsTableTableManager get currencySettings =>
      $$CurrencySettingsTableTableManager(_db, _db.currencySettings);
  $$ExchangeRatesTableTableManager get exchangeRates =>
      $$ExchangeRatesTableTableManager(_db, _db.exchangeRates);
}
