-- create database ipangram_ecom
-- use ipangram_ecom;

create table users(
	id int not null auto_increment,
    name varchar(50),
	email varchar(50) unique,
	password varchar(50),
    token text,
    primary key(id)
);



create table products(
	id int not null auto_increment,
    product_name varchar(50),
	product_type varchar(50),
    primary key(id)
);

create table orders(
	id int auto_increment,
    user_id int not null,
    product_id int not null,
    status varchar(50),
    primary key (id),
    foreign key (user_id) references users (id),
    foreign key (product_id) references products (id)
    ON DELETE cascade
);


create table cart(
	id int auto_increment,
    user_id int not null,
    product_id int not null,
    primary key (id),
    foreign key (user_id) references users (id),
    foreign key (product_id) references products (id)
    ON DELETE cascade
);


